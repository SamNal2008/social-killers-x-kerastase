import { supabase } from '~/shared/services/supabase';
import { databaseService } from './databaseService';
import type {
  GeneratedImage,
  ImageGenerationError,
} from '../types';
import { mapErrorCodeToType, isRetryableError } from '../types';

interface GenerateSingleImageRequest {
  userPhoto: string;
  userResultId: string;
  imageIndex: number;
}

/**
 * Edge function response interface
 */
interface EdgeFunctionResponse {
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

/**
 * Creates a standardized image generation error
 */
const createImageGenerationError = (
  code: string,
  message: string
): ImageGenerationError => {
  const errorCode = mapErrorCodeToType(code);
  return {
    code: errorCode,
    message,
    isRetryable: isRetryableError(errorCode),
  };
};

/**
 * Service for generating AI images using Gemini API
 * Orchestrates edge function calls, storage uploads, and database operations
 */
export const geminiImageService = {
  /**
   * Fetches existing generated images for a user result from database
   *
   * @param userResultId - User result ID
   * @returns Array of generated images
   */
  async fetchExistingImages(userResultId: string): Promise<GeneratedImage[]> {
    return databaseService.fetchExistingImages(userResultId);
  },

  /**
   * Generates a single AI image
   * Calls edge function (which generates + uploads) → saves to database
   *
   * @param request - Generation request with user photo, result ID, and image index
   * @returns Generated image with public URL
   */
  async generateSingleImage(
    request: GenerateSingleImageRequest
  ): Promise<GeneratedImage> {
    try {
      // Step 1: Call edge function (generates image + uploads to storage)
      console.log(`Calling edge function for image ${request.imageIndex}...`);
      const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>(
        'generate-image',
        {
          body: {
            userPhoto: request.userPhoto,
            userResultId: request.userResultId,
            imageIndex: request.imageIndex,
          },
        }
      );

      if (error) {
        console.error('Edge function error:', error);
        throw createImageGenerationError('NETWORK_ERROR', error.message);
      }

      if (!data) {
        throw createImageGenerationError('UNKNOWN', 'No response from image generation service');
      }

      if (!data.success) {
        const errorCode = data.error?.code || 'UNKNOWN';
        const errorMessage = data.error?.message || 'Unknown error';
        throw createImageGenerationError(errorCode, errorMessage);
      }

      if (!data.data || !data.data.imageUrl) {
        throw createImageGenerationError('UNKNOWN', 'No image URL returned from generation service');
      }

      const publicUrl = data.data.imageUrl;

      // Step 2: Save to database
      console.log(`Saving image ${request.imageIndex} to database...`);
      await databaseService.saveGeneratedImage(
        request.userResultId,
        publicUrl,
        data.data.prompt,
        request.imageIndex
      );

      // Step 4: Return generated image
      return {
        id: `${request.userResultId}-${Date.now()}-${request.imageIndex}`,
        url: publicUrl,
        prompt: data.data.prompt,
        timestamp: Date.now(),
        imageIndex: request.imageIndex,
      };
    } catch (error) {
      console.error(`Error generating image ${request.imageIndex}:`, error);

      // If already an ImageGenerationError, rethrow
      if ((error as ImageGenerationError).code) {
        throw error;
      }

      // Otherwise, wrap in standard error
      throw createImageGenerationError(
        'UNKNOWN',
        error instanceof Error ? error.message : 'Failed to generate image'
      );
    }
  },

  /**
   * Retries generation of a failed image
   *
   * @param request - Generation request
   * @returns Generated image
   */
  async retryFailedImage(
    request: GenerateSingleImageRequest
  ): Promise<GeneratedImage> {
    return this.generateSingleImage(request);
  },
};
