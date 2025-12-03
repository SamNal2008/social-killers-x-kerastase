import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  userResultId: string;
  userPhoto: string;
  imageIndex: number;
}

interface GenerateImageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    prompt: string;
    imageIndex: number;
  };
  error?: {
    code: string;
    message: string;
    isRetryable: boolean;
  };
}

const RETRYABLE_ERROR_CODES = ['RATE_LIMITED', 'SERVER_ERROR'];

const isRetryableErrorCode = (code: string): boolean => {
  return RETRYABLE_ERROR_CODES.includes(code);
};

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
        isRetryable: isRetryableErrorCode(code),
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

/**
 * Calls Gemini API to generate an image
 * Returns base64-encoded image data
 */
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

      if (response.status === 429) {
        throw new Error(`RATE_LIMITED: Too many requests to Gemini API`);
      }
      if (response.status >= 500) {
        throw new Error(`SERVER_ERROR: Gemini API server error (${response.status})`);
      }
      if (response.status >= 400) {
        throw new Error(`GENERATION_FAILED: Gemini API request failed (${response.status})`);
      }
      throw new Error(`GENERATION_FAILED: ${response.status} ${response.statusText}`);
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

/**
 * Uploads base64 image to Supabase Storage
 * Returns public URL
 */
const uploadToStorage = async (
  supabase: ReturnType<typeof createClient>,
  imageBase64: string,
  userResultId: string,
  imageIndex: number
): Promise<string> => {
  // Convert base64 to binary
  const binaryData = Uint8Array.from(atob(imageBase64), c => c.charCodeAt(0));
  const blob = new Blob([binaryData], { type: 'image/jpeg' });
  const filename = `${userResultId}-${Date.now()}-${imageIndex}.jpg`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`UPLOAD_FAILED: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filename);

  let publicUrl = data.publicUrl;

  // Replace Kong URL with public-facing URL for local development
  if (publicUrl.includes('kong:8000')) {
    publicUrl = publicUrl.replace('http://kong:8000', 'http://127.0.0.1:54321');
    console.log('Replaced Kong URL with local URL:', publicUrl.substring(0, 80));
  }

  console.log(`Image uploaded: ${publicUrl.substring(0, 60)}...`);
  return publicUrl;
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

    if (requestBody.imageIndex === undefined || typeof requestBody.imageIndex !== 'number') {
      return buildErrorResponse('INVALID_REQUEST', 'imageIndex is required and must be a number', 400);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestBody.userResultId)) {
      return buildErrorResponse('INVALID_REQUEST', 'userResultId must be a valid UUID', 400);
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

    // Fetch prompt from tribe
    const prompt = await fetchTribePrompt(supabase, requestBody.userResultId);
    console.log(`Generating image for user result: ${requestBody.userResultId}, index: ${requestBody.imageIndex}`);

    // Generate image with retry logic
    const imageBase64 = await retryWithBackoff(
      () => callGeminiAPI(requestBody.userPhoto, prompt)
    );

    console.log(`Successfully generated image ${requestBody.imageIndex}`);

    // Upload to storage
    const imageUrl = await uploadToStorage(
      supabase,
      imageBase64,
      requestBody.userResultId,
      requestBody.imageIndex
    );

    // Return image URL (frontend will handle database save)
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageUrl,
          prompt,
          imageIndex: requestBody.imageIndex,
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

    const errorCode = errorMessage.includes('RATE_LIMITED') ? 'RATE_LIMITED' :
      errorMessage.includes('SERVER_ERROR') ? 'SERVER_ERROR' :
        'GENERATION_FAILED';

    return buildErrorResponse(errorCode, errorMessage, 500);
  }
});
