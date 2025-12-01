// Hook for managing image generation state and logic

import { useState, useCallback } from 'react';
import { imageGenerationService } from '../services/imageGenerationService';
import type { GenerateImageRequest } from '../services/imageGenerationService';

type ImageGenerationState =
    | { status: 'idle' }
    | { status: 'generating' }
    | { status: 'success'; imageUrl: string }
    | { status: 'error'; error: Error };

export function useImageGeneration() {
    const [state, setState] = useState<ImageGenerationState>({ status: 'idle' });

    const generateImage = useCallback(async (request: GenerateImageRequest) => {
        setState({ status: 'generating' });

        try {
            const response = await imageGenerationService.generateImage(request);
            setState({ status: 'success', imageUrl: response.imageUrl });
            return response.imageUrl;
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Failed to generate image');
            setState({ status: 'error', error: errorObj });
            throw errorObj;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ status: 'idle' });
    }, []);

    return {
        state,
        generateImage,
        reset,
    };
}
