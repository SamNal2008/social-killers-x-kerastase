// Image generation service - calls Supabase Edge Function

import { supabase } from '~/shared/services/supabase';

export interface GenerateImageRequest {
    userResultId: string;
    userPhoto: string; // Base64 encoded image
}

export interface GenerateImageResponse {
    imageUrl: string;
    userResultId: string;
}

export const imageGenerationService = {
    /**
     * Generates a personalized image using the Edge Function
     */
    async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
        if (!request.userResultId) {
            throw new Error('User result ID is required');
        }

        if (!request.userPhoto) {
            throw new Error('User photo is required');
        }

        try {
            const { data, error } = await supabase.functions.invoke('generate-image', {
                body: {
                    userResultId: request.userResultId,
                    userPhoto: request.userPhoto,
                },
            });

            if (error) {
                console.error('Edge function error:', error);
                throw new Error(`Failed to generate image: ${error.message}`);
            }

            if (!data || !data.imageUrl) {
                throw new Error('Invalid response from image generation service');
            }

            return data as GenerateImageResponse;
        } catch (error) {
            console.error('Error generating image:', error);
            throw error instanceof Error ? error : new Error('Failed to generate image');
        }
    },
};
