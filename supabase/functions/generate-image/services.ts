// Business logic for image generation

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import type { GenerateImageRequest, GeminiImageResponse } from './types.ts';
import { generatePrompt } from './prompts.ts';
import { AppError, APIError, StorageError, DatabaseError } from '../_shared/errors.ts';

const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Generates an image using Google Gemini API
 * NOTE: This is a placeholder implementation. Gemini 2.0 Flash generates text, not images.
 * For actual image generation, you would need to use:
 * - Google's Imagen API
 * - Stability AI
 * - DALL-E
 * - Or another image generation service
 * 
 * For now, this returns the original image as a placeholder for testing the flow.
 */
export async function generateImageWithGemini(
    userPhoto: string,
    prompt: string
): Promise<string> {
    console.log(`[PLACEHOLDER] Would generate image with prompt: "${prompt}"`);
    console.log('[PLACEHOLDER] Using original image as placeholder for testing');

    // For testing: return the original image
    // In production, this would call an actual image generation API
    const base64Image = userPhoto.replace(/^data:image\/\w+;base64,/, '');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Replace with actual image generation API call
    // Example with Gemini (text generation):
    // if (!GEMINI_API_KEY) {
    //     throw new APIError('Google Gemini API key not configured');
    // }
    // const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {...});

    // For now, return the original image
    return base64Image;
}

/**
 * Uploads generated image to Supabase Storage
 */
export async function uploadImageToStorage(
    imageData: string,
    userResultId: string
): Promise<string> {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new StorageError('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Convert base64 to blob
        const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
        const blob = new Blob([binaryData], { type: 'image/jpeg' });

        // Generate unique filename
        const filename = `${userResultId}-${Date.now()}.jpg`;
        const filePath = `${filename}`;

        // Upload to storage
        const { data, error } = await supabase.storage
            .from('generated-images')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw new StorageError(`Failed to upload image: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error('Error uploading to storage:', error);
        throw new StorageError(`Storage operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Updates user_results table with generated image URL
 */
export async function updateUserResultWithImage(
    userResultId: string,
    imageUrl: string
): Promise<void> {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new DatabaseError('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { error } = await supabase
            .from('user_results')
            .update({ generated_image_url: imageUrl })
            .eq('id', userResultId);

        if (error) {
            console.error('Database update error:', error);
            throw new DatabaseError(`Failed to update user result: ${error.message}`);
        }
    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error('Error updating database:', error);
        throw new DatabaseError(`Database operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Main business logic: Generate image and store it
 */
export async function processImageGeneration(
    request: GenerateImageRequest
): Promise<string> {
    const { userResultId, userPhoto } = request;

    // Generate prompt
    const prompt = generatePrompt(userResultId);
    console.log(`Generating image with prompt: ${prompt}`);

    // Generate image with Gemini
    const generatedImageData = await generateImageWithGemini(userPhoto, prompt);
    console.log('Image generated successfully');

    // Upload to storage
    const imageUrl = await uploadImageToStorage(generatedImageData, userResultId);
    console.log(`Image uploaded to: ${imageUrl}`);

    // Update database
    await updateUserResultWithImage(userResultId, imageUrl);
    console.log('Database updated successfully');

    return imageUrl;
}
