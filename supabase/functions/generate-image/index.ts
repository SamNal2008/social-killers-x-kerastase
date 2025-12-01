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
}

interface GenerateImageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    userResultId: string;
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
 * Generates the prompt for image generation
 * Currently returns a hardcoded prompt
 */
const generatePrompt = (userResultId: string): string => {
  return "Take this picture and make him happy to code now";
};

/**
 * Generates an image (placeholder implementation)
 * NOTE: Returns original image for testing. Replace with actual image generation API.
 */
const generateImage = async (userPhoto: string, prompt: string): Promise<string> => {
  console.log(`[PLACEHOLDER] Would generate image with prompt: "${prompt}"`);
  console.log('[PLACEHOLDER] Using original image as placeholder for testing');

  const base64Image = userPhoto.replace(/^data:image\/\w+;base64,/, '');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return base64Image;
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

    // Generate prompt
    const prompt = generatePrompt(requestBody.userResultId);
    console.log(`Generating image for user result: ${requestBody.userResultId}`);

    // Generate image (placeholder)
    const generatedImageData = await generateImage(requestBody.userPhoto, prompt);
    console.log('Image generated successfully');

    // Upload to storage
    const binaryData = Uint8Array.from(atob(generatedImageData), c => c.charCodeAt(0));
    const blob = new Blob([binaryData], { type: 'image/jpeg' });
    const filename = `${requestBody.userResultId}-${Date.now()}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return buildErrorResponse('STORAGE_ERROR', `Failed to upload image: ${uploadError.message}`, 500);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);

    console.log(`Image uploaded to: ${publicUrl}`);

    // Update database
    const { error: updateError } = await supabase
      .from('user_results')
      .update({ generated_image_url: publicUrl })
      .eq('id', requestBody.userResultId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return buildErrorResponse('DATABASE_ERROR', `Failed to update user result: ${updateError.message}`, 500);
    }

    console.log('Database updated successfully');

    // Return success response with camelCase
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          imageUrl: publicUrl,
          userResultId: requestBody.userResultId,
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