import { useState, useEffect, useRef } from 'react';

/**
 * Ensures a loading state is displayed for a minimum duration to prevent flickering
 * on fast network responses.
 *
 * @param isLoading - The actual loading state from data fetching
 * @param minimumDuration - Minimum time in milliseconds to show loading state (default: 500ms)
 * @returns Whether the loading indicator should still be shown
 */
export function useMinimumLoadingTime(
  isLoading: boolean,
  minimumDuration: number = 500
): boolean {
  const [shouldShowLoading, setShouldShowLoading] = useState(isLoading);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // When loading starts, record the start time
    if (isLoading && loadingStartTimeRef.current === null) {
      loadingStartTimeRef.current = Date.now();
      setShouldShowLoading(true);
    }

    // When loading finishes
    if (!isLoading && loadingStartTimeRef.current !== null) {
      const elapsedTime = Date.now() - loadingStartTimeRef.current;
      const remainingTime = minimumDuration - elapsedTime;

      if (remainingTime > 0) {
        // Still need to show loading for remaining time
        timeoutRef.current = setTimeout(() => {
          setShouldShowLoading(false);
          loadingStartTimeRef.current = null;
        }, remainingTime);
      } else {
        // Minimum duration already elapsed
        setShouldShowLoading(false);
        loadingStartTimeRef.current = null;
      }
    }

    // Cleanup timeout on unmount or when isLoading changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isLoading, minimumDuration]);

  return shouldShowLoading;
}
