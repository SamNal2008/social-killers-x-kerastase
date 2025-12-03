import { useState, useEffect, useCallback, useRef } from 'react';
import { toJpeg } from 'html-to-image';
import type {
  AiMoodboardState,
  TribePromptData,
  GeneratedImage,
  ImageSlotState,
  ImageGenerationError,
} from '../types';
import { geminiImageService } from '../services/geminiImageService';
import { supabase } from '~/shared/services/supabase';

const NUMBER_OF_IMAGES = 3;

interface UseAiMoodboardParams {
  userResultId: string;
  userPhoto: string;
}

interface UseAiMoodboardReturn {
  state: AiMoodboardState;
  currentImageIndex: number;
  currentImage: GeneratedImage | null;
  imageSlots: ImageSlotState[];
  nextImage: () => void;
  previousImage: () => void;
  goToImage: (index: number) => void;
  downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
  retryImage: (index: number) => Promise<void>;
  retryAllFailed: () => Promise<void>;
  canGoNext: boolean;
  canGoPrevious: boolean;
  hasFailedImages: boolean;
  downloadPolaroid: (element: HTMLElement, filename?: string) => Promise<void>;
  isDownloading: boolean;
}

const createInitialSlots = (count: number): ImageSlotState[] =>
  Array.from({ length: count }, () => ({ status: 'pending' as const }));

const createErrorState = (message: string): ImageGenerationError => ({
  code: 'UNKNOWN',
  message,
  isRetryable: true,
});

export const useAiMoodboard = ({
  userResultId,
  userPhoto,
}: UseAiMoodboardParams): UseAiMoodboardReturn => {
  const [state, setState] = useState<AiMoodboardState>({ status: 'idle' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const [imageSlots, setImageSlots] = useState<ImageSlotState[]>(
    createInitialSlots(NUMBER_OF_IMAGES)
  );
  const isGeneratingRef = useRef(false);
  const userPhotoRef = useRef(userPhoto);

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

    return {
      tribeId: tribe.id,
      tribeName: tribe.name,
      subcultureName: userAnswer.moodboard.subculture.name,
      keywords: [],
    };
  }, [userResultId]);

  const updateSlot = useCallback((index: number, slotState: ImageSlotState) => {
    setImageSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = slotState;
      return newSlots;
    });
  }, []);

  const generateImagesProgressively = useCallback(
    async (tribeData: TribePromptData, startFromIndex = 0) => {
      // Atomic lock - prevent race conditions
      const wasGenerating = isGeneratingRef.current;
      isGeneratingRef.current = true;

      if (wasGenerating) {
        console.warn('Generation already in progress, skipping duplicate call');
        return;
      }

      try {
        const initialSlots = createInitialSlots(NUMBER_OF_IMAGES);
        for (let i = 0; i < startFromIndex; i++) {
          const existingSlot = imageSlots[i];
          if (existingSlot.status === 'success') {
            initialSlots[i] = existingSlot;
          }
        }

        for (let i = startFromIndex; i < NUMBER_OF_IMAGES; i++) {
          initialSlots[i] = { status: 'loading' };
        }

        setImageSlots(initialSlots);
        setState({ status: 'generating', imageSlots: initialSlots, tribe: tribeData });

        const generatedImages: GeneratedImage[] = [];
        const failedSlots: number[] = [];
        let lastError: ImageGenerationError | undefined;

        for (let index = startFromIndex; index < NUMBER_OF_IMAGES; index++) {
          // Update slot directly to avoid dependency on updateSlot
          setImageSlots((prev) => {
            const newSlots = [...prev];
            newSlots[index] = { status: 'loading' };
            return newSlots;
          });

          try {
            const image = await geminiImageService.generateSingleImage({
              userPhoto: userPhotoRef.current,
              userResultId,
              imageIndex: index,
            });

            generatedImages.push(image);
            setImageSlots((prev) => {
              const newSlots = [...prev];
              newSlots[index] = { status: 'success', image };
              return newSlots;
            });
          } catch (error) {
            const imageError = (error as ImageGenerationError).code
              ? (error as ImageGenerationError)
              : createErrorState(
                error instanceof Error ? error.message : 'Unknown error'
              );

            failedSlots.push(index);
            lastError = imageError;
            setImageSlots((prev) => {
              const newSlots = [...prev];
              newSlots[index] = { status: 'error', error: imageError };
              return newSlots;
            });

            if (!imageError.isRetryable) {
              for (let j = index + 1; j < NUMBER_OF_IMAGES; j++) {
                failedSlots.push(j);
                setImageSlots((prev) => {
                  const newSlots = [...prev];
                  newSlots[j] = { status: 'error', error: imageError };
                  return newSlots;
                });
              }
              break;
            }
          }
        }

        // Clear base64 data from memory after all generations complete
        userPhotoRef.current = '';
        console.log('Base64 image data cleared from memory');

        const allImages = [...generatedImages];
        for (let i = 0; i < startFromIndex; i++) {
          const existingSlot = imageSlots[i];
          if (existingSlot.status === 'success') {
            allImages.unshift(existingSlot.image);
          }
        }
        allImages.sort((a, b) => a.imageIndex - b.imageIndex);

        if (failedSlots.length > 0 && allImages.length > 0) {
          setState({
            status: 'partial-success',
            images: allImages,
            failedSlots,
            tribe: tribeData,
            error: lastError!,
          });
        } else if (failedSlots.length > 0) {
          setState({
            status: 'error',
            error: lastError || createErrorState('Failed to generate images'),
          });
        } else {
          setState({ status: 'success', images: allImages, tribe: tribeData });
        }
      } finally {
        // Always reset lock in finally block
        isGeneratingRef.current = false;
      }
    },
    [userResultId, imageSlots]
  );

  useEffect(() => {
    const initializeAndGenerate = async () => {
      try {
        setState({ status: 'loading-tribe' });
        const tribeData = await fetchTribeData();

        const existingImages = await geminiImageService.fetchExistingImages(userResultId);

        if (existingImages.length >= NUMBER_OF_IMAGES) {
          const slots: ImageSlotState[] = existingImages.map((image) => ({
            status: 'success' as const,
            image,
          }));
          setImageSlots(slots);
          setState({ status: 'success', images: existingImages, tribe: tribeData });
          return;
        }

        if (existingImages.length > 0) {
          const slots = createInitialSlots(NUMBER_OF_IMAGES);
          existingImages.forEach((image) => {
            slots[image.imageIndex] = { status: 'success', image };
          });
          setImageSlots(slots);
        }

        await generateImagesProgressively(tribeData, existingImages.length);
      } catch (error) {
        console.error('Error initializing moodboard:', error);
        setState({
          status: 'error',
          error: createErrorState(
            error instanceof Error ? error.message : 'Failed to initialize'
          ),
        });
      }
    };

    initializeAndGenerate();
    // Only re-run when userResultId changes (component mount or new user)
    // fetchTribeData and generateImagesProgressively are stable callbacks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userResultId]);

  const retryImage = useCallback(
    async (index: number) => {
      if (state.status !== 'partial-success' && state.status !== 'error') return;

      const tribeData =
        state.status === 'partial-success'
          ? state.tribe
          : await fetchTribeData();

      updateSlot(index, { status: 'loading' });

      try {
        const image = await geminiImageService.retryFailedImage({
          userPhoto: userPhotoRef.current,
          userResultId,
          imageIndex: index,
        });

        updateSlot(index, { status: 'success', image });

        setImageSlots((currentSlots) => {
          const allSuccessful = currentSlots.every(
            (slot, i) =>
              i === index
                ? true
                : slot.status === 'success'
          );

          if (allSuccessful) {
            const allImages = currentSlots.map((slot, i) =>
              i === index ? image : (slot as { status: 'success'; image: GeneratedImage }).image
            );
            setState({ status: 'success', images: allImages, tribe: tribeData });
          }

          return currentSlots;
        });
      } catch (error) {
        const imageError = (error as ImageGenerationError).code
          ? (error as ImageGenerationError)
          : createErrorState(
            error instanceof Error ? error.message : 'Unknown error'
          );
        updateSlot(index, { status: 'error', error: imageError });
      }
    },
    [state, userResultId, fetchTribeData, updateSlot]
  );

  const retryAllFailed = useCallback(async () => {
    const failedIndexes = imageSlots
      .map((slot, index) => (slot.status === 'error' ? index : -1))
      .filter((index) => index !== -1);

    for (const index of failedIndexes) {
      await retryImage(index);
    }
  }, [imageSlots, retryImage]);

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

  const goToImage = useCallback((index: number) => {
    const successfulCount = imageSlots.filter((s) => s.status === 'success').length;
    if (index >= 0 && index < successfulCount) {
      setCurrentImageIndex(index);
    }
  }, [imageSlots]);

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

  /**
   * Download Polaroid component as image
   * Converts the Polaroid DOM element to JPEG using html-to-image
   * Waits for fonts to load before capturing for accurate rendering
   */
  const downloadPolaroid = useCallback(async (element: HTMLElement, filename?: string) => {
    // Change file extension to .jpg
    const finalFilename = filename?.replace('.png', '.jpg') || `polaroid-${Date.now()}.jpg`;

    try {
      setIsDownloading(true);

      // Wait for fonts to load before capturing
      await document.fonts.ready;

      // Convert DOM element to JPEG data URL with 2x pixel ratio (reduced from 3x)
      const dataUrl = await toJpeg(element, {
        quality: 0.9, // 90% quality for good balance of size and quality
        pixelRatio: 2, // Reduced from 3x to 2x (still high quality, 78% smaller file)
        backgroundColor: '#F5F5F5', // Light gray background matching surface-light
        cacheBust: true, // Prevent caching issues with images
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Try to share on mobile, download on desktop
      if (isMobileDevice() && navigator.share && navigator.canShare) {
        const file = new File([blob], finalFilename, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Signature Polaroid',
            text: 'Check out my signature polaroid!',
          });
          console.log('Polaroid shared successfully');
          return;
        }
      }

      // Desktop or fallback: Download directly
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // If user cancels share dialog, don't treat it as an error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }

      console.error('Error downloading polaroid:', error);
      throw new Error('Failed to download polaroid');
    } finally {
      setIsDownloading(false);
    }
  }, [isMobileDevice]);


  // Compute derived values
  const currentImage = state.status === 'success' ? state.images[currentImageIndex] : null;
  const getCurrentImage = (): GeneratedImage | null => {
    if (state.status === 'success' || state.status === 'partial-success') {
      return state.images[currentImageIndex] || null;
    }
    const slot = imageSlots[currentImageIndex];
    if (slot?.status === 'success') {
      return slot.image;
    }
    return null;
  };

  const getSuccessfulImages = (): GeneratedImage[] => {
    if (state.status === 'success' || state.status === 'partial-success') {
      return state.images;
    }
    return imageSlots
      .filter((slot): slot is { status: 'success'; image: GeneratedImage } => slot.status === 'success')
      .map((slot) => slot.image);
  };

  const successfulImages = getSuccessfulImages();
  const canGoNext = successfulImages.length > 0 && currentImageIndex < successfulImages.length - 1;
  const canGoPrevious = currentImageIndex > 0;
  const hasFailedImages = imageSlots.some((slot) => slot.status === 'error');

  return {
    state,
    currentImageIndex,
    currentImage,
    imageSlots,
    nextImage,
    previousImage,
    goToImage,
    downloadImage,
    downloadPolaroid,
    isDownloading,
    retryImage,
    retryAllFailed,
    canGoNext,
    canGoPrevious,
    hasFailedImages,
  };
};
