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

interface EdgeFunctionResponse {
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
            const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

            const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>('generate-image', {
                body: {
                    userResultId: request.userResultId,
                    userPhoto: request.userPhoto,
                },
                headers: {
                    Authorization: `Bearer ${anonKey}`,
                },
            });

            if (error) {
                console.error('Edge function error:', error);
                throw new Error(`Failed to generate image: ${error.message}`);
            }

            if (!data) {
                throw new Error('No response from image generation service');
            }

            if (!data.success || !data.data) {
                const errorMessage = data.error?.message || 'Unknown error';
                throw new Error(`Image generation failed: ${errorMessage}`);
            }

            return data.data;
        } catch (error) {
            console.error('Error generating image:', error);
            throw error instanceof Error ? error : new Error('Failed to generate image');
        }
    },
};
