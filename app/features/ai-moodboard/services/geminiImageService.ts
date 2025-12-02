import { supabase } from '~/shared/services/supabase';
import type { GeminiGenerateImageRequest, GeminiGenerateImageResponse, GeneratedImage } from '../types';

/**
 * Service for generating AI moodboard images using Gemini
 * Communicates with Supabase Edge Function for secure API access
 */
export const geminiImageService = {
  /**
   * Generate multiple AI images based on prompt and user photo
   * @throws Error if validation fails or generation fails
   */
  async generateImages(request: GeminiGenerateImageRequest): Promise<GeneratedImage[]> {

    if (!request.userPhoto || request.userPhoto.trim().length === 0) {
      throw new Error('User photo is required');
    }

    if (!request.userResultId || request.userResultId.trim().length === 0) {
      throw new Error('User result ID is required');
    }

    if (request.numberOfImages < 1) {
      throw new Error('Number of images must be at least 1');
    }

    try {
      // Call Supabase Edge Function (consolidated generate-image function)
      const { data, error } = await supabase.functions.invoke<GeminiGenerateImageResponse>(
        'generate-image',
        {
          body: {
            userPhoto: request.userPhoto,
            userResultId: request.userResultId,
            numberOfImages: request.numberOfImages,
          },
        }
      );

      // Handle Edge Function errors
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to generate images: ${error.message}`);
      }

      // Handle missing response
      if (!data) {
        throw new Error('No response from image generation service');
      }

      // Handle unsuccessful generation
      if (!data.success) {
        const errorMessage = data.error?.message || 'Unknown error';
        throw new Error(errorMessage);
      }

      // Handle missing data or images
      if (!data.data || !data.data.images || data.data.images.length === 0) {
        throw new Error('No images returned from generation service');
      }

      // Transform response to GeneratedImage format
      const timestamp = Date.now();
      return data.data.images.map((image, index) => ({
        id: `${request.userResultId}-${timestamp}-${index}`,
        url: image.url,
        prompt: image.prompt,
        timestamp,
      }));
    } catch (error) {
      console.error('Error generating images:', error);
      throw error instanceof Error ? error : new Error('Failed to generate images');
    }
  },
};
