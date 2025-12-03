import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  userResultId: string;
  userPhoto: string;
  prompt?: string;
  numberOfImages?: number;
}

interface GeneratedImageData {
  url: string;
  prompt: string;
}

interface GenerateImageResponse {
  success: boolean;
  data?: {
    imageUrl?: string;
    userResultId: string;
    images?: GeneratedImageData[];
  };
  error?: {
    code: string;
    message: string;
  };
}

const buildErrorResponse = (
  code: string,
  message: string,
  status: number
): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
      },
    } satisfies GenerateImageResponse),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

/**
 * Fetches the image generation prompt for the user's tribe
 * Queries the database to get the tribe associated with the user result
 * and returns the tribe's image_generation_prompt
 */
const fetchTribePrompt = async (
  supabase: ReturnType<typeof createClient>,
  userResultId: string
): Promise<string> => {

  const { data, error } = await supabase
    .from('user_results')
    .select(`
      tribe_id,
      tribes!inner (
        name,
        image_generation_prompt
      )
    `)
    .eq('id', userResultId)
    .single();

  if (error) {
    console.error('Error fetching tribe prompt:', error);
    throw new Error(`Failed to fetch tribe information: ${error.message}`);
  }

  if (!data) {
    throw new Error(`User result not found: ${userResultId}`);
  }


  const tribeData = data.tribes as { name: string; image_generation_prompt: string | null };

  if (!tribeData.image_generation_prompt) {
    throw new Error(`No image generation prompt configured for tribe: ${tribeData.name}`);
  }

  console.log(`Using prompt for tribe: ${tribeData.name}`);
  return tribeData.image_generation_prompt;
};


/**
 * Helper function to add delay between API calls
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry wrapper with exponential backoff
 * Handles 429 (Too Many Requests) errors by retrying with increasing delays
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');


      const is429Error = lastError.message.includes('429') ||
        lastError.message.includes('Too Many Requests');


      if (attempt === maxRetries - 1 || !is429Error) {
        throw lastError;
      }


      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`Rate limit hit. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await delay(delayMs);
    }
  }

  throw lastError!;
};

const callGeminiAPI = async (userPhoto: string, prompt: string): Promise<string> => {

  const geminiApiEndpoint = Deno.env.get('GEMINI_API_ENDPOINT') || "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent";
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');


  if (!geminiApiEndpoint) {
    throw new Error('GEMINI_API_ENDPOINT environment variable is not set');
  }

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }


  const base64Image = userPhoto.replace(/^data:image\/\w+;base64,/, '');

  console.log(`Calling Gemini API with prompt: "${prompt.substring(0, 50)}..."`);

  try {

    const response = await fetch(geminiApiEndpoint, {
      method: 'POST',
      headers: {
        'x-goog-api-key': `${geminiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['Text', 'Image'],
          imageConfig: {
            aspectRatio: '3:4',
          },
        },
      }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Gemini API request failed: ${response.status} ${response.statusText}`);
    }


    const data = await response.json();


    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Invalid API response structure:', data);
      throw new Error('Invalid response from Gemini API: missing candidates');
    }


    const candidate = data.candidates[0];
    const parts = candidate?.content?.parts;

    if (!parts || !Array.isArray(parts)) {
      console.error('No parts in candidate:', candidate);
      throw new Error('No parts returned from Gemini API');
    }


    const imagePart = parts.find((part: { inlineData?: { mimeType: string; data: string } }) =>
      part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData?.data) {
      console.error('No image data in parts:', parts);
      throw new Error('No image data returned from Gemini API');
    }

    const generatedImageBase64 = imagePart.inlineData.data;

    console.log('Successfully generated image via Gemini API');

    return generatedImageBase64;
  } catch (error) {

    console.error('Gemini API call failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      prompt: prompt.substring(0, 100),
      endpoint: geminiApiEndpoint.substring(0, 50) + '...',
    });


    if (error instanceof Error) {
      throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error('Failed to generate image: Unknown error');
  }
};

const uploadToStorage = async (
  supabase: ReturnType<typeof createClient>,
  imageData: string,
  userResultId: string,
  imageIndex: number
): Promise<string> => {
  const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
  const blob = new Blob([binaryData], { type: 'image/jpeg' });
  const filename = `${userResultId}-${Date.now()}-${imageIndex}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filename);

  // Replace internal Kong URL with public-facing URL for local development
  // In production, this will use the actual Supabase URL
  const publicFacingUrl = Deno.env.get('PUBLIC_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
  const correctedUrl = publicUrl.replace('http://kong:8000', publicFacingUrl);

  console.log(`Original URL: ${publicUrl}`);
  console.log(`Corrected URL: ${correctedUrl}`);

  return correctedUrl;
};

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {

    if (req.method !== 'POST') {
      return buildErrorResponse('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405);
    }


    let requestBody: GenerateImageRequest;
    try {
      requestBody = await req.json();
    } catch {
      return buildErrorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
    }


    if (!requestBody.userResultId || typeof requestBody.userResultId !== 'string') {
      return buildErrorResponse('INVALID_REQUEST', 'userResultId is required and must be a string', 400);
    }


    if (!requestBody.userPhoto || typeof requestBody.userPhoto !== 'string') {
      return buildErrorResponse('INVALID_REQUEST', 'userPhoto is required and must be a base64 string', 400);
    }


    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestBody.userResultId)) {
      return buildErrorResponse('INVALID_REQUEST', 'userResultId must be a valid UUID', 400);
    }


    const numberOfImages = requestBody.numberOfImages || 1;
    if (numberOfImages < 1 || numberOfImages > 10) {
      return buildErrorResponse('INVALID_REQUEST', 'numberOfImages must be between 1 and 10', 400);
    }



    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return buildErrorResponse('CONFIGURATION_ERROR', 'Server configuration error', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Get or fetch prompt from tribe
    const prompt = await fetchTribePrompt(supabase, requestBody.userResultId);
    console.log(`Generating ${numberOfImages} image(s) for user result: ${requestBody.userResultId}`);



    const generatedImages = [];
    const DELAY_BETWEEN_CALLS_MS = 2000;

    for (let index = 0; index < numberOfImages; index++) {
      try {

        if (index > 0) {
          console.log(`Waiting ${DELAY_BETWEEN_CALLS_MS}ms before generating image ${index + 1}...`);
          await delay(DELAY_BETWEEN_CALLS_MS);
        }

        console.log(`Generating image ${index + 1}/${numberOfImages}...`);


        const generatedImageData = await retryWithBackoff(
          () => callGeminiAPI(requestBody.userPhoto, prompt)
        );


        const publicUrl = await uploadToStorage(supabase, generatedImageData, requestBody.userResultId, index);

        console.log(`Image ${index + 1}/${numberOfImages} uploaded: ${publicUrl}`);

        generatedImages.push({
          url: publicUrl,
          prompt,
        });
      } catch (error) {
        console.error(`Error generating image ${index + 1}:`, error);
        throw error;
      }
    }

    console.log(`Successfully generated ${generatedImages.length} image(s)`);

    // Save all generated images to the database
    const imagesToInsert = generatedImages.map((image, index) => ({
      user_result_id: requestBody.userResultId,
      image_url: image.url,
      prompt: image.prompt,
      image_index: index,
      is_primary: index === 0, // First image is the primary
    }));

    const { error: upsertError } = await supabase
      .from('generated_images')
      .upsert(imagesToInsert, {
        onConflict: 'user_result_id,image_index',
        ignoreDuplicates: false, // Update existing records if they exist
      });

    if (upsertError) {
      console.error('Error saving images to database:', upsertError);
      return buildErrorResponse('DATABASE_ERROR', `Failed to save images: ${upsertError.message}`, 500);
    }

    console.log(`Saved ${generatedImages.length} image(s) to database`);

    // Update user_results with the first generated image URL for backward compatibility
    const { error: updateError } = await supabase
      .from('user_results')
      .update({ generated_image_url: generatedImages[0].url })
      .eq('id', requestBody.userResultId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return buildErrorResponse('DATABASE_ERROR', `Failed to update user result: ${updateError.message}`, 500);
    }

    console.log('Database updated successfully with first image URL');




    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...(numberOfImages === 1 && { imageUrl: generatedImages[0].url }),
          userResultId: requestBody.userResultId,
          images: generatedImages,
        },
      } satisfies GenerateImageResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return buildErrorResponse('INTERNAL_ERROR', errorMessage, 500);
  }
});