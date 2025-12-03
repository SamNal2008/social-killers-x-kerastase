import { forwardRef, useState, useEffect } from "react";
import { Title, Body, Caption } from "~/shared/components/Typography";

export interface PolaroidProps {
  imageSrc?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  currentItem?: number;
  totalItems?: number;
  className?: string;
  showDate?: boolean;
  onImageLoad?: () => void;
  onImageError?: () => void;
}

const formatDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits
  return `${day}.${month}.${year}`;
};

export const Polaroid = forwardRef<HTMLDivElement, PolaroidProps>(({
  imageSrc,
  imageAlt,
  title,
  subtitle = "Swipe to decide",
  currentItem,
  totalItems,
  className = "",
  showDate = true,
  onImageLoad,
  onImageError,
}, ref) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loaded state when image source changes
  useEffect(() => {
    if (imageSrc) {
      setImageLoaded(false);
    }
  }, [imageSrc]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageLoaded(false);
    onImageError?.();
  };

  const showCounter = currentItem !== undefined && totalItems !== undefined;
  return (
    <div
      ref={ref}
      className={`
        bg-neutral-white
        rounded-lg
        p-6
        flex flex-col gap-6
        shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]
        w-full
        max-w-[343px]
        md:max-w-[400px]
        lg:max-w-[450px]
        mx-auto
        aspect-[3/4]
        ${className}
      `}
    >
      <div className="flex-1 bg-neutral-gray-200 rounded overflow-hidden flex items-center justify-center min-h-0 relative">
        {imageSrc ? (
          <>
            <img
              key={imageSrc}
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="eager"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-gray-200">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        ) : (
          <Title variant="h1" className="text-neutral-dark text-center px-4">
            {title}
          </Title>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-white pt-2">
        <Body variant="2" className="text-neutral-gray">
          {subtitle}
        </Body>
        {showCounter ? (
          <Caption variant="2" className="text-neutral-dark">
            {currentItem} / {totalItems}
          </Caption>
        ) : showDate ? (
          <Caption variant="2" className="text-neutral-dark">
            {formatDate()}
          </Caption>
        ) : null}
      </div>
    </div>
  );
});

Polaroid.displayName = 'Polaroid';
