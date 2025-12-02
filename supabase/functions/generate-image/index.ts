// Generate Image Edge Function
// Generates personalized images from user selfies

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateImageRequest {
  userResultId: string;
  userPhoto: string; // Base64 encoded image
  prompt?: string; // Optional custom prompt
  numberOfImages?: number; // Optional, defaults to 1 for backward compatibility
}

interface GeneratedImageData {
  url: string;
  prompt: string;
}

interface GenerateImageResponse {
  success: boolean;
  data?: {
    imageUrl?: string; // For single image (backward compatibility)
    userResultId: string;
    images?: GeneratedImageData[]; // For multiple images
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
 * Generates the default prompt for image generation
 * Used when no custom prompt is provided
 */
const generateDefaultPrompt = (userResultId: string): string => {
  return "Take this picture and make him happy to code now";
};

/**
 * Calls Gemini API to generate an image
 * TODO: Replace placeholder with actual Gemini API integration
 * NOTE: Returns original image for testing.
 */
const callGeminiAPI = async (userPhoto: string, prompt: string): Promise<string> => {
  console.log(`[PLACEHOLDER] Would generate image with prompt: "${prompt.substring(0, 50)}..."`);
  console.log('[PLACEHOLDER] Using original image as placeholder for testing');

  const base64Image = userPhoto.replace(/^data:image\/\w+;base64,/, '');

  // Simulate API delay (1-3 seconds per image)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  return base64Image;

  // TODO: Actual Gemini API call would look like:
  /*
  const geminiApiEndpoint = Deno.env.get('GEMINI_API_ENDPOINT');
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

  const response = await fetch(geminiApiEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${geminiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image: userPhoto,
      model: 'imagen-3.0-generate-001',
      aspectRatio: '1:1',
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.generatedImage;
  */
};

/**
 * Upload image to Supabase Storage
 */
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

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filename);

  return publicUrl;
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return buildErrorResponse('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405);
    }

    // Parse and validate request body
    let requestBody: GenerateImageRequest;
    try {
      requestBody = await req.json();
    } catch {
      return buildErrorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    // Validate userResultId
    if (!requestBody.userResultId || typeof requestBody.userResultId !== 'string') {
      return buildErrorResponse('INVALID_REQUEST', 'userResultId is required and must be a string', 400);
    }

    // Validate userPhoto
    if (!requestBody.userPhoto || typeof requestBody.userPhoto !== 'string') {
      return buildErrorResponse('INVALID_REQUEST', 'userPhoto is required and must be a base64 string', 400);
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestBody.userResultId)) {
      return buildErrorResponse('INVALID_REQUEST', 'userResultId must be a valid UUID', 400);
    }

    // Validate numberOfImages (optional, defaults to 1)
    const numberOfImages = requestBody.numberOfImages || 1;
    if (numberOfImages < 1 || numberOfImages > 10) {
      return buildErrorResponse('INVALID_REQUEST', 'numberOfImages must be between 1 and 10', 400);
    }

    // Initialize Supabase client with service role key
    // Note: Using service role key bypasses RLS and allows public access
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

    // Get or generate prompt
    const prompt = requestBody.prompt || generateDefaultPrompt(requestBody.userResultId);
    console.log(`Generating ${numberOfImages} image(s) for user result: ${requestBody.userResultId}`);

    // Generate multiple images in parallel
    const imagePromises = Array.from({ length: numberOfImages }, async (_, index) => {
      try {
        // Call Gemini API
        const generatedImageData = await callGeminiAPI(requestBody.userPhoto, prompt);

        // Upload to storage
        const publicUrl = await uploadToStorage(supabase, generatedImageData, requestBody.userResultId, index);

        console.log(`Image ${index + 1}/${numberOfImages} uploaded: ${publicUrl}`);

        return {
          url: publicUrl,
          prompt,
        };
      } catch (error) {
        console.error(`Error generating image ${index + 1}:`, error);
        throw error;
      }
    });

    // Wait for all images to be generated
    const generatedImages = await Promise.all(imagePromises);

    console.log(`Successfully generated ${generatedImages.length} image(s)`);

    // For backward compatibility: if single image, also update database
    if (numberOfImages === 1) {
      const { error: updateError } = await supabase
        .from('user_results')
        .update({ generated_image_url: generatedImages[0].url })
        .eq('id', requestBody.userResultId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return buildErrorResponse('DATABASE_ERROR', `Failed to update user result: ${updateError.message}`, 500);
      }

      console.log('Database updated successfully');
    }

    // Return success response
    // For single image: include imageUrl for backward compatibility
    // For multiple images: include images array
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