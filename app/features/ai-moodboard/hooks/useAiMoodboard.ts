import { useState, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import type { AiMoodboardState, TribePromptData, GeneratedImage, UseAiMoodboardReturn } from '../types';
import { geminiImageService } from '../services/geminiImageService';
import { supabase } from '~/shared/services/supabase';

interface UseAiMoodboardParams {
  userResultId: string;
  userPhoto: string;
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
  const [isDownloading, setIsDownloading] = useState(false);


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
   * Generate images on mount and pre-convert to data URLs for mobile compatibility
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

        // Convert all image URLs to data URLs to avoid CORS issues during capture
        // This is done once upfront rather than during download for reliability
        const imagesWithDataUrls = await Promise.all(
          images.map(async (image) => {
            try {
              const dataUrl = await convertImageUrlToDataUrl(image.url);
              return { ...image, url: dataUrl };
            } catch (error) {
              console.error('Failed to convert image to data URL, keeping original:', error);
              // Keep original URL if conversion fails
              return image;
            }
          })
        );

        setState({ status: 'success', images: imagesWithDataUrls, tribe: tribeData });
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

  /**
   * Verify that an image is truly loaded and accessible
   * Checks both complete status and natural dimensions
   */
  const verifyImageLoaded = (img: HTMLImageElement): boolean => {
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  };

  /**
   * Verify that an image is ready for canvas rendering
   * Tests by actually drawing to a test canvas - more reliable than just checking complete
   */
  const verifyImageCanvasReady = (img: HTMLImageElement): boolean => {
    try {
      // Create a small test canvas
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      const ctx = testCanvas.getContext('2d');

      if (!ctx) return false;

      // Try to draw the image - this will fail if image isn't ready
      ctx.drawImage(img, 0, 0, 1, 1);

      // If we got here, image is canvas-ready
      return true;
    } catch (error) {
      // Drawing failed - image not ready yet
      return false;
    }
  };

  /**
   * Convert an image URL to a data URL by fetching it as a blob first
   * This solves CORS issues on mobile Safari by bypassing the image element entirely
   */
  const convertImageUrlToDataUrl = async (imageUrl: string): Promise<string> => {
    try {
      // Fetch the image as a blob with CORS mode
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Convert blob to data URL using FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          if (dataUrl) {
            resolve(dataUrl);
          } else {
            reject(new Error('FileReader returned empty result'));
          }
        };
        reader.onerror = () => {
          reject(new Error('FileReader failed to read blob'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image URL to data URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Attempt to capture element with specified pixel ratio
   * Returns null if capture fails or produces empty result
   */
  const attemptCapture = async (
    element: HTMLElement,
    pixelRatio: number
  ): Promise<Blob | null> => {
    try {
      const dataUrl = await toPng(element, {
        pixelRatio,
        backgroundColor: '#F5F5F5', // Light gray background matching surface-light
        cacheBust: true, // Prevent caching issues with images
        skipFonts: false, // Ensure fonts are included
      });

      // Verify we got a valid data URL
      if (!dataUrl || dataUrl === 'data:,') {
        console.warn(`Capture at ${pixelRatio}x produced empty data URL`);
        return null;
      }

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Verify blob has meaningful content (at least 10KB)
      // A polaroid with image should be much larger than 10KB
      if (blob.size < 10000) {
        console.warn(`Capture at ${pixelRatio}x produced suspiciously small blob: ${blob.size} bytes`);
        return null;
      }

      return blob;
    } catch (error) {
      console.warn(`Capture failed at ${pixelRatio}x:`, error);
      return null;
    }
  };

  /**
   * Comprehensive wait for element to be fully ready for capture
   * Checks fonts, images, canvas-ready state, and rendering stability
   */
  const waitForElementReady = async (element: HTMLElement): Promise<void> => {
    console.log('Starting comprehensive ready check...');

    // Step 1: Wait for fonts
    await document.fonts.ready;
    console.log('✓ Fonts ready');

    // Step 2: Get all images
    const images = element.querySelectorAll('img');
    console.log(`Found ${images.length} images`);

    // Step 3: Wait for images to load
    await Promise.all(
      Array.from(images).map((img) => {
        if (verifyImageLoaded(img)) return Promise.resolve();

        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail, just continue
          setTimeout(() => resolve(), 10000); // 10s timeout
        });
      })
    );
    console.log('✓ Images loaded');

    // Step 4: Wait for images to be canvas-ready with extended timeout
    const maxWaitTime = 10000; // 10 seconds for mobile
    const checkInterval = 300; // Check every 300ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const allReady = Array.from(images).every(img => verifyImageCanvasReady(img));

      if (allReady) {
        const elapsed = Date.now() - startTime;
        console.log(`✓ All images canvas-ready after ${elapsed}ms`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    // Step 5: Wait for rendering to stabilize using requestAnimationFrame
    // This ensures the browser has fully painted the element
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    }));
    console.log('✓ Rendering stable');

    // Step 6: Final delay for mobile to ensure everything is settled
    if (isMobileDevice()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('✓ Mobile settle time complete');
    } else {
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('✓ Desktop settle time complete');
    }

    console.log('✓ Element fully ready for capture');
  };

  /**
   * Download Polaroid component as image
   * Converts the Polaroid DOM element to a PNG using html-to-image
   * Uses comprehensive ready check and 3x scale with automatic fallback
   * Images are already data URLs from generation, avoiding CORS issues
   */
  const downloadPolaroid = useCallback(async (element: HTMLElement, filename?: string) => {
    const finalFilename = filename || `polaroid-${Date.now()}.png`;

    try {
      setIsDownloading(true);

      // Comprehensive wait for everything to be ready
      await waitForElementReady(element);

      // Try 3x scale first (as requested), with automatic fallback
      const scaleAttempts = [3, 2, 1.5];
      let blob: Blob | null = null;
      let successfulScale: number | null = null;

      for (const scale of scaleAttempts) {
        console.log(`Attempting capture at ${scale}x scale...`);
        blob = await attemptCapture(element, scale);

        if (blob) {
          successfulScale = scale;
          console.log(`Successfully captured at ${scale}x scale (${blob.size} bytes)`);
          break;
        }
      }

      // If all attempts failed, throw error
      if (!blob || !successfulScale) {
        throw new Error('Unable to capture polaroid image. All scale attempts failed.');
      }

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

      // Log detailed error information for debugging
      const images = element.querySelectorAll('img');
      console.error('Error downloading polaroid:', {
        error,
        isMobile: isMobileDevice(),
        elementDimensions: {
          width: element.offsetWidth,
          height: element.offsetHeight,
        },
        imageCount: images.length,
        imageStates: Array.from(images).map(img => ({
          src: img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        })),
      });

      // User-friendly error message
      throw new Error('Unable to download polaroid. Please ensure you have a stable connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  }, [isMobileDevice]);


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
    downloadPolaroid,
    isDownloading,
    canGoNext,
    canGoPrevious,
  };
};
