import { Body, Caption } from '~/shared/components/Typography';

interface PolaroidLoaderProps {
  imageNumber: number;
  className?: string;
}

const TOTAL_IMAGES = 3;

export const PolaroidLoader = ({ imageNumber, className = '' }: PolaroidLoaderProps) => {
  return (
    <div
      data-testid="polaroid-loader"
      role="status"
      aria-live="polite"
      aria-label={`Generating image ${imageNumber} of ${TOTAL_IMAGES}`}
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
      <div className="flex-1 bg-neutral-gray-200 rounded overflow-hidden flex flex-col items-center justify-center gap-4 min-h-0">
        <div
          data-testid="loading-spinner"
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        <Body variant="2" className="text-neutral-dark text-center px-4">
          Generating image {imageNumber}/{TOTAL_IMAGES}...
        </Body>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-white pt-2">
        <Body variant="2" className="text-neutral-gray">
          Please wait
        </Body>
        <Caption variant="2" className="text-neutral-dark">
          {imageNumber} / {TOTAL_IMAGES}
        </Caption>
      </div>
    </div>
  );
};
