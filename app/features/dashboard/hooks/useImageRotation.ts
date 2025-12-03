import { useState, useEffect } from 'react';

export const useImageRotation = (images: string[], interval: number = 3000): string | undefined => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  return images[currentIndex];
};
