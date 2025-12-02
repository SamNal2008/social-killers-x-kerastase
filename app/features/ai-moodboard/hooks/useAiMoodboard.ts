import { useState, useEffect, useCallback } from 'react';
import type { AiMoodboardState, TribePromptData, GeneratedImage } from '../types';
import { geminiImageService } from '../services/geminiImageService';
import { supabase } from '~/shared/services/supabase';

interface UseAiMoodboardParams {
  userResultId: string;
  userPhoto: string;
}

interface UseAiMoodboardReturn {
  state: AiMoodboardState;
  currentImageIndex: number;
  currentImage: GeneratedImage | null;
  nextImage: () => void;
  previousImage: () => void;
  downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Hook for managing AI moodboard state and interactions
 * Fetches user result, generates images, and handles navigation
 */
export const useAiMoodboard = ({
  userResultId,
  userPhoto,
}: UseAiMoodboardParams): UseAiMoodboardReturn => {
  const [state, setState] = useState<AiMoodboardState>({ status: 'idle' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /**
   * Fetch user result and tribe data
   */
  const fetchTribeData = useCallback(async (): Promise<TribePromptData> => {
    const { data, error } = await supabase
      .from('user_results')
      .select(`
        id,
        tribe:tribes!user_results_tribe_id_fkey(
          id,
          name
        ),
        user_answer:user_answers!user_results_user_answer_id_fkey(
          moodboard:moodboards!user_answers_moodboard_id_fkey(
            subculture:subcultures!moodboards_subculture_id_fkey(
              id,
              name
            )
          )
        )
      `)
      .eq('id', userResultId)
      .single();

    if (error || !data) {
      console.error('Supabase query error:', error);
      throw new Error('Failed to fetch user result data');
    }

    // Extract tribe information
    const tribe = data.tribe as unknown as { id: string; name: string } | null;
    const userAnswer = data.user_answer as unknown as {
      moodboard: {
        subculture: { id: string; name: string } | null;
      } | null;
    } | null;

    if (!tribe) {
      throw new Error('Missing tribe data');
    }

    if (!userAnswer?.moodboard?.subculture) {
      throw new Error('Missing subculture data');
    }

    // For now, use empty keywords array (will be enhanced later)
    return {
      tribeId: tribe.id,
      tribeName: tribe.name,
      subcultureName: userAnswer.moodboard.subculture.name,
      keywords: [],
    };
  }, [userResultId]);

  /**
   * Generate images on mount
   */
  useEffect(() => {
    const generateImages = async () => {
      try {
        // Fetch tribe data first
        setState({ status: 'loading-tribe' });
        const tribeData = await fetchTribeData();

        // Then generate images
        setState({ status: 'generating' });
        const images = await geminiImageService.generateImages({
          userPhoto,
          userResultId,
          numberOfImages: 3,
        });

        setState({ status: 'success', images, tribe: tribeData });
      } catch (error) {
        console.error('Error generating images:', error);
        const errorObj = error instanceof Error ? error : new Error('Failed to generate images');
        setState({ status: 'error', error: errorObj });
      }
    };

    generateImages();
  }, [userResultId, userPhoto, fetchTribeData]);

  /**
   * Navigation handlers
   */
  const nextImage = useCallback(() => {
    if (state.status === 'success') {
      setCurrentImageIndex((prev) => Math.min(prev + 1, state.images.length - 1));
    }
  }, [state]);

  const previousImage = useCallback(() => {
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Fallback download function (used when Web Share API is unavailable)
   */
  const fallbackDownload = useCallback(async (imageUrl: string, filename: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }, []);

  /**
   * Check if device is mobile
   */
  const isMobileDevice = useCallback(() => {
    // Check for touch capability and screen size
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobileScreen = window.innerWidth <= 768;
    return hasTouchScreen && isMobileScreen;
  }, []);

  /**
   * Share/Download image handler
   * Uses Web Share API on mobile devices, downloads directly on desktop
   */
  const downloadImage = useCallback(async (imageUrl: string, filename?: string) => {
    const finalFilename = filename || `moodboard-${Date.now()}.jpg`;

    try {
      // Only use Web Share API on mobile devices
      if (isMobileDevice() && navigator.share && navigator.canShare) {
        // Fetch image as blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Create File object from blob
        const file = new File([blob], finalFilename, { type: blob.type });

        // Check if files can be shared
        if (navigator.canShare({ files: [file] })) {
          // Share the image
          await navigator.share({
            files: [file],
            title: 'My Signature Moodboard',
            text: 'Check out my signature moodboard!',
          });
          console.log('Image shared successfully');
          return;
        }
      }

      // Desktop: Always download directly
      await fallbackDownload(imageUrl, finalFilename);
    } catch (error) {
      // If user cancels share dialog, don't treat it as an error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }

      // For other errors, try fallback download
      console.error('Error sharing image:', error);
      try {
        await fallbackDownload(imageUrl, finalFilename);
      } catch (downloadError) {
        console.error('Error downloading image:', downloadError);
        throw new Error('Failed to share or download image');
      }
    }
  }, [fallbackDownload, isMobileDevice]);

  // Compute derived values
  const currentImage = state.status === 'success' ? state.images[currentImageIndex] : null;
  const canGoNext = state.status === 'success' && currentImageIndex < state.images.length - 1;
  const canGoPrevious = currentImageIndex > 0;

  return {
    state,
    currentImageIndex,
    currentImage,
    nextImage,
    previousImage,
    downloadImage,
    canGoNext,
    canGoPrevious,
  };
};
