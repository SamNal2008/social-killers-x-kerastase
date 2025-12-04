import { useEffect, useRef, useState } from 'react';
import { imagePollingService } from '../services/imagePollingService';
import type { GeneratedImage } from '../types';

interface UseImagePollingProps {
  userResultId: string;
  enabled: boolean;
  onImagesUpdate: (images: GeneratedImage[]) => void;
  onComplete: () => void;
}

interface UseImagePollingReturn {
  isPolling: boolean;
  error: Error | null;
}

const POLLING_INTERVAL = 1000;

const convertUrlToDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(blob);
  });
};

export const useImagePolling = ({
  userResultId,
  enabled,
  onImagesUpdate,
  onComplete,
}: UseImagePollingProps): UseImagePollingReturn => {
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCompleteRef = useRef<boolean>(false);

  useEffect(() => {
    if (!enabled || isCompleteRef.current) {
      return;
    }

    const poll = async () => {
      try {
        const result = await imagePollingService.pollGeneratedImages(userResultId);

        if (result.images.length > 0) {
          const imagesWithDataUrls = await Promise.all(
            result.images.map(async (image) => {
              const dataUrl = await convertUrlToDataUrl(image.url);
              return { ...image, url: dataUrl };
            })
          );

          onImagesUpdate(imagesWithDataUrls);
        }

        if (result.isComplete) {
          isCompleteRef.current = true;
          onComplete();
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (pollingError) {
        const errorMessage = pollingError instanceof Error
          ? pollingError
          : new Error('Unknown polling error');
        setError(errorMessage);
        console.error('Polling error:', errorMessage);
      }
    };

    poll();

    intervalRef.current = setInterval(poll, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, userResultId, onImagesUpdate, onComplete]);

  return {
    isPolling: enabled && !isCompleteRef.current,
    error,
  };
};
