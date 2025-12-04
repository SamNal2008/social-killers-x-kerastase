import { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import type { AiMoodboardState, TribePromptData, GeneratedImage, UseAiMoodboardReturn, ImageSlot } from '../types';
import { geminiImageService } from '../services/geminiImageService';
import { useImagePolling } from './useImagePolling';
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
  const [isImageReady, setIsImageReady] = useState(false);
  const generationStartedRef = useRef(false);


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
   * Handle images update from polling
   */
  const handleImagesUpdate = useCallback((images: GeneratedImage[]) => {
    setState((prevState) => {
      if (prevState.status !== 'generating') return prevState;

      const updatedSlots: [ImageSlot, ImageSlot, ImageSlot] = [
        { status: 'pending' },
        { status: 'pending' },
        { status: 'pending' },
      ];

      images.forEach((image, index) => {
        if (index < 3) {
          updatedSlots[index] = {
            status: 'ready',
            image,
          };
        }
      });

      return {
        ...prevState,
        imageSlots: updatedSlots,
      };
    });
  }, []);

  /**
   * Handle polling completion
   */
  const handlePollingComplete = useCallback(() => {
    setState((prevState) => {
      if (prevState.status !== 'generating') return prevState;

      const readyImages = prevState.imageSlots
        .filter((slot) => slot.status === 'ready' && slot.image)
        .map((slot) => slot.image!);

      if (readyImages.length > 0) {
        return {
          status: 'complete',
          images: readyImages,
          tribe: prevState.tribe,
        };
      }

      return prevState;
    });
  }, []);

  /**
   * Start polling for images
   */
  const { isPolling } = useImagePolling({
    userResultId,
    enabled: state.status === 'generating',
    onImagesUpdate: handleImagesUpdate,
    onComplete: handlePollingComplete,
  });

  /**
   * Generate images on mount and start polling
   * Uses ref guard to prevent duplicate calls in React Strict Mode
   */
  useEffect(() => {
    if (generationStartedRef.current) {
      return;
    }
    generationStartedRef.current = true;

    const startGeneration = async () => {
      try {
        setState({ status: 'loading-tribe' });
        const tribeData = await fetchTribeData();

        setState({
          status: 'generating',
          imageSlots: [
            { status: 'pending' },
            { status: 'pending' },
            { status: 'pending' },
          ],
          tribe: tribeData,
        });

        geminiImageService.generateImages({
          userPhoto,
          userResultId,
          numberOfImages: 3,
        }).catch((error) => {
          console.error('Error generating images:', error);
          const errorObj = error instanceof Error ? error : new Error('Failed to generate images');
          setState({ status: 'error', error: errorObj });
        });
      } catch (error) {
        console.error('Error fetching tribe data:', error);
        const errorObj = error instanceof Error ? error : new Error('Failed to fetch tribe data');
        setState({ status: 'error', error: errorObj });
      }
    };

    startGeneration();
  }, [userResultId, userPhoto, fetchTribeData]);

  /**
   * Navigation handlers - Reset image ready state when changing images
   */
  const nextImage = useCallback(() => {
    if (state.status === 'complete') {
      setIsImageReady(false);
      setCurrentImageIndex((prev) => Math.min(prev + 1, state.images.length - 1));
    } else if (state.status === 'generating') {
      // Allow navigation to all slots, not just ready ones
      // This enables progressive display with loaders for pending slots
      setIsImageReady(false);
      setCurrentImageIndex((prev) => Math.min(prev + 1, state.imageSlots.length - 1));
    }
  }, [state]);

  const previousImage = useCallback(() => {
    setIsImageReady(false);
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Handle image load event from Polaroid component
   */
  const handleImageReady = useCallback(() => {
    setIsImageReady(true);
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
   * Wait for element to be ready for capture
   * Simplified approach: just wait for fonts and a brief settle time
   */
  const waitForElementReady = async (): Promise<void> => {
    // Wait for fonts
    await document.fonts.ready;

    // Wait for next frame to ensure rendering is complete
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Small additional delay for stability
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  /**
   * Verify image is ready for capture
   */
  const verifyImageReady = (element: HTMLElement, expectedImageUrl: string): void => {
    const imgElement = element.querySelector('img');
    if (!imgElement) {
      throw new Error('No image found in polaroid');
    }

    // Verify the image URL matches expected (prevents wrong image capture)
    if (imgElement.src !== expectedImageUrl) {
      console.warn('Image URL mismatch:', {
        expected: expectedImageUrl.substring(0, 100),
        actual: imgElement.src.substring(0, 100)
      });
      throw new Error('Image not ready - URL mismatch');
    }

    // Verify image is loaded
    if (!imgElement.complete || imgElement.naturalWidth === 0) {
      throw new Error('Image not fully loaded');
    }
  };

  /**
   * Manually render polaroid to canvas for reliable mobile capture
   * Draws the complete polaroid structure including white frame and padding
   * Uses actual DOM dimensions for pixel-perfect accuracy
   */
  const renderPolaroidToCanvas = async (element: HTMLElement): Promise<Blob> => {
    const imgElement = element.querySelector('img');
    if (!imgElement) {
      throw new Error('No image found in polaroid');
    }

    // Get the actual rendered dimensions from DOM
    const polaroidRect = element.getBoundingClientRect();
    const imageContainer = element.querySelector('.flex-1') as HTMLElement;
    const textContainer = element.querySelector('.flex.items-center.justify-between') as HTMLElement;

    if (!imageContainer || !textContainer) {
      throw new Error('Could not find polaroid sections');
    }

    const imageContainerRect = imageContainer.getBoundingClientRect();
    const textContainerRect = textContainer.getBoundingClientRect();

    // Get the text content
    const subtitle = element.querySelector('.text-neutral-gray')?.textContent || '';
    const dateText = element.querySelector('.text-neutral-dark')?.textContent || '';

    // Use actual dimensions
    const scale = 3; // High quality
    const totalWidth = polaroidRect.width;
    const totalHeight = polaroidRect.height;
    const borderRadius = 8; // rounded-lg

    // Calculate positions relative to polaroid
    const imageX = imageContainerRect.left - polaroidRect.left;
    const imageY = imageContainerRect.top - polaroidRect.top;
    const imageWidth = imageContainerRect.width;
    const imageHeight = imageContainerRect.height;

    const textX = textContainerRect.left - polaroidRect.left;
    const textY = textContainerRect.top - polaroidRect.top;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth * scale;
    canvas.height = totalHeight * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Scale for high quality
    ctx.scale(scale, scale);

    // Enable better rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw white background with rounded corners
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(0, 0, totalWidth, totalHeight, borderRadius);
    ctx.fill();
    ctx.clip(); // Clip everything to rounded rect

    // Draw gray background for image area
    ctx.fillStyle = '#E5E5E5'; // neutral-gray-200
    ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

    // Draw the image (maintaining aspect ratio, object-cover behavior)
    try {
      const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight;
      const areaAspect = imageWidth / imageHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > areaAspect) {
        // Image is wider - fit height
        drawHeight = imageHeight;
        drawWidth = drawHeight * imgAspect;
        drawX = imageX - (drawWidth - imageWidth) / 2;
        drawY = imageY;
      } else {
        // Image is taller - fit width
        drawWidth = imageWidth;
        drawHeight = drawWidth / imgAspect;
        drawX = imageX;
        drawY = imageY - (drawHeight - imageHeight) / 2;
      }

      // Clip to image area before drawing
      ctx.save();
      ctx.beginPath();
      ctx.rect(imageX, imageY, imageWidth, imageHeight);
      ctx.clip();
      ctx.drawImage(imgElement, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    } catch (error) {
      console.error('Failed to draw image:', error);
      throw new Error('Failed to render image on canvas');
    }

    // Draw text section using actual position from DOM
    // Load font
    await document.fonts.ready;

    // Calculate text baseline position (middle of text container)
    const textBaselineY = textY + (textContainerRect.height / 2);

    // Draw subtitle (left side)
    ctx.fillStyle = '#737373'; // neutral-gray
    ctx.font = '14px Inter, -apple-system, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(subtitle, textX, textBaselineY);

    // Draw date (right side)
    ctx.fillStyle = '#262626'; // neutral-dark
    const dateMetrics = ctx.measureText(dateText);
    const dateX = textX + textContainerRect.width - dateMetrics.width;
    ctx.fillText(dateText, dateX, textBaselineY);

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > 10000) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create valid blob from canvas'));
        }
      }, 'image/png', 1.0);
    });
  };

  /**
   * Capture polaroid - Try canvas rendering, fallback to html-to-image
   */
  const capturePolaroid = async (element: HTMLElement): Promise<Blob> => {
    try {
      // Try canvas rendering first (most reliable for polaroid structure)
      console.log('Attempting canvas rendering...');
      const blob = await renderPolaroidToCanvas(element);
      console.log(`Canvas rendering successful (${blob.size} bytes)`);
      return blob;
    } catch (canvasError) {
      // Fallback to html-to-image
      console.warn('Canvas rendering failed, falling back to html-to-image:', canvasError);

      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        cacheBust: true,
        skipFonts: false,
      });

      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Both capture methods failed');
      }

      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (blob.size < 10000) {
        throw new Error('Captured image is too small');
      }

      return blob;
    }
  };

  /**
   * Download Polaroid - Bulletproof implementation
   * Relies on image readiness tracking + html-to-image for accurate capture
   */
  const downloadPolaroid = useCallback(async (element: HTMLElement, filename?: string) => {
    const finalFilename = filename || `polaroid-${Date.now()}.png`;

    if (!isImageReady) {
      throw new Error('Please wait for the image to fully load before downloading');
    }

    try {
      setIsDownloading(true);

      // Get current image URL to verify
      let currentImageUrl: string | null = null;
      if (state.status === 'complete') {
        currentImageUrl = state.images[currentImageIndex]?.url || null;
      } else if (state.status === 'generating') {
        const slot = state.imageSlots[currentImageIndex];
        currentImageUrl = slot?.status === 'ready' ? slot.image?.url || null : null;
      }

      if (!currentImageUrl) {
        throw new Error('No image selected');
      }

      // Verify image is ready and matches expected URL
      verifyImageReady(element, currentImageUrl);

      // Wait for element to be ready for capture
      await waitForElementReady();

      // Capture the polaroid (includes frame, padding, styling, etc.)
      console.log('Capturing polaroid with html-to-image...');
      const blob = await capturePolaroid(element);
      console.log(`Polaroid captured successfully (${blob.size} bytes)`);

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
      console.log('Polaroid downloaded successfully');
    } catch (error) {
      // If user cancels share dialog, don't treat it as an error
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Share cancelled by user');
        return;
      }

      console.error('Error downloading polaroid:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Unable to download polaroid. Please try again.'
      );
    } finally {
      setIsDownloading(false);
    }
  }, [isImageReady, state, currentImageIndex, isMobileDevice]);


  // Compute derived values
  const currentImage = (() => {
    if (state.status === 'complete') {
      return state.images[currentImageIndex] || null;
    } else if (state.status === 'generating') {
      const readySlot = state.imageSlots[currentImageIndex];
      return readySlot?.status === 'ready' ? readySlot.image || null : null;
    }
    return null;
  })();

  const canGoNext = (() => {
    if (state.status === 'complete') {
      return currentImageIndex < state.images.length - 1;
    } else if (state.status === 'generating') {
      // Allow navigation to next slot even if it's still generating
      // This enables progressive display with loaders for pending slots
      return currentImageIndex < state.imageSlots.length - 1;
    }
    return false;
  })();

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
    isImageReady,
    handleImageReady,
    canGoNext,
    canGoPrevious,
  };
};
