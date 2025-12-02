import { useEffect } from 'react';

export const useScrollToTop = (): void => {
  useEffect(() => {
    // Check if window.scrollTo exists (SSR safety)
    if (typeof window !== 'undefined' && window.scrollTo) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, []); // Empty deps array - only run on mount
};
