import type { FC } from 'react';
import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { useAiMoodboard } from '../hooks/useAiMoodboard';
import type { ImageSlotState } from '../types';
import { Polaroid } from '~/shared/components/Polaroid';
import { CircleButton } from '~/shared/components/CircleButton';
import { Button } from '~/shared/components/Button';
import { Title, Body, Caption } from '~/shared/components/Typography';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';
import { localStorageUtils } from '~/shared/utils/localStorage';


interface LocationState {
  userPhoto?: string;
  userResultId?: string;
  userName?: string;
}

interface ImageSlotProps {
  slot: ImageSlotState;
  index: number;
  isActive: boolean;
  onRetry: () => void;
  onClick: () => void;
}

const ImageSlotSkeleton: FC = () => (
  <div className="aspect-[3/4] bg-neutral-gray-200 rounded-lg animate-pulse flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-neutral-gray-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ImageSlotError: FC<{ onRetry: () => void; isRetryable: boolean }> = ({ onRetry, isRetryable }) => (
  <div className="aspect-[3/4] bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center gap-3 p-4">
    <svg
      className="w-8 h-8 text-red-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <Caption variant="2" className="text-red-600 text-center">
      Failed to generate
    </Caption>
    {isRetryable && (
      <button
        onClick={onRetry}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

const ImageSlotComponent: FC<ImageSlotProps> = ({ slot, index, isActive, onRetry, onClick }) => {
  if (slot.status === 'pending' || slot.status === 'loading') {
    return <ImageSlotSkeleton />;
  }

  if (slot.status === 'error') {
    return <ImageSlotError onRetry={onRetry} isRetryable={slot.error.isRetryable} />;
  }

  return (
    <Button
      onClick={onClick}
      className={`aspect-[3/4] rounded-lg overflow-hidden transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
        }`}
      aria-label={`View image ${index + 1}`}
    >
      <img
        src={slot.image.url}
        alt={`Generated moodboard ${index + 1}`}
        className="w-full h-full object-cover"
      />
    </Button>
  );
};

export const AiMoodboardScreen: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const polaroidRef = useRef<HTMLDivElement>(null);

  // Get data from location state or localStorage
  const userPhoto = locationState?.userPhoto;
  const userResultId = locationState?.userResultId || localStorageUtils.getUserResultId();
  const userName = locationState?.userName || localStorageUtils.getUserName() || 'Your';

  // Redirect if missing required data
  if (!userResultId || !userPhoto) {
    console.error('Missing required data:', { userResultId, userPhoto: !!userPhoto });
    navigate('/');
    return null;
  }

  const {
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
  } = useAiMoodboard({ userResultId, userPhoto });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    if (polaroidRef.current && state.status === 'success') {
      try {
        const subcultureName = state.tribe.subcultureName.toLowerCase().replace(/\s+/g, '-');
        const filename = `${userName}-polaroid-${subcultureName}.jpg`;
        await downloadPolaroid(polaroidRef.current, filename);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download polaroid. Please try again.');
      }
    }
  };


  // Loading state
  if (state.status === 'idle' || state.status === 'loading-tribe') {
    return (
      <div className="bg-surface-light min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Body variant="1" className="text-neutral-gray text-center">
            {state.status === 'loading-tribe' ? 'Loading your tribe...' : 'Initializing...'}
          </Body>
        </div>
      </div>
    );
  }

  // Generating state - show progressive loading with image slots
  if (state.status === 'generating') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-2xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={staggerItemVariants} className="flex flex-col gap-4">
            <Caption variant="1" className="text-primary text-center uppercase tracking-wider">
              {state.tribe.tribeName}
            </Caption>
            <Title variant="h1" className="text-neutral-dark text-center">
              Generating your moodboard...
            </Title>
            <Body variant="1" className="text-neutral-gray text-center">
              Please wait while we create your personalized images.
            </Body>
          </motion.div>

          {/* Small Preview Images */}
          <motion.div variants={staggerItemVariants} className="flex justify-center gap-2">
            {imageSlots.map((slot, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-md overflow-hidden border-2 ${slot.status === 'success' ? 'border-primary' : 'border-neutral-gray-200'
                  }`}
              >
                {slot.status === 'success' && slot.image?.url ? (
                  <img
                    src={slot.image.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : slot.status === 'loading' ? (
                  <div className="w-full h-full bg-neutral-gray-100 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-neutral-gray-100" />
                )}
              </div>
            ))}
          </motion.div>

          {/* Progress indicator */}
          <motion.div variants={staggerItemVariants} className="flex justify-center">
            <Body variant="2" className="text-neutral-gray">
              {imageSlots.filter((s) => s.status === 'success').length} of {imageSlots.length} images ready
            </Body>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <div className="bg-surface-light min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-md">
          <Title variant="h1" className="text-neutral-dark text-center">
            Oops!
          </Title>
          <Body variant="1" className="text-neutral-gray text-center">
            {state.error.message}
          </Body>
          <div className="flex flex-col gap-3 w-full">
            {state.error.isRetryable && (
              <Button onClick={retryAllFailed} variant="primary" className="w-full">
                Try Again
              </Button>
            )}
            <Button onClick={handleBack} variant="secondary" className="w-full">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Partial success state - some images generated, some failed
  if (state.status === 'partial-success') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-2xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={staggerItemVariants} className="flex flex-col gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-neutral-gray-200/20 transition-colors w-fit"
              aria-label="Go back"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-dark">
                <path d="M8.75 3.5L5.25 7L8.75 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Caption variant="2" className="text-neutral-dark">Back</Caption>
            </button>

            <Caption variant="1" className="text-primary text-center uppercase tracking-wider">
              {state.tribe.tribeName}
            </Caption>

            <div className="flex flex-col gap-4">
              <Title variant="h1" className="text-neutral-dark text-center">
                {userName}'s signature moodboard
              </Title>
              <Body variant="1" className="text-neutral-gray text-center">
                Some images couldn't be generated. You can retry or continue with the available images.
              </Body>
            </div>
          </motion.div>

          {/* Main Image */}
          {currentImage && (
            <motion.div variants={staggerItemVariants}>
              <Polaroid
                imageSrc={currentImage.url}
                imageAlt={`Moodboard ${currentImageIndex + 1}`}
                title=""
                subtitle="Tribes & Communities Day"
                className="w-full"
              />
            </motion.div>
          )}

          {/* Small Preview Images */}
          <motion.div variants={staggerItemVariants} className="flex justify-center gap-2">
            {imageSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => slot.status === 'success' && goToImage(index)}
                className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${index === currentImageIndex
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : slot.status === 'success'
                    ? 'border-primary hover:ring-2 hover:ring-primary hover:ring-offset-1'
                    : 'border-neutral-gray-200'
                  }`}
              >
                {slot.status === 'success' && slot.image?.url ? (
                  <img
                    src={slot.image.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : slot.status === 'error' ? (
                  <div className="w-full h-full bg-red-100 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-red-500">
                      <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full bg-neutral-gray-100" />
                )}
              </button>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div variants={staggerItemVariants} className="flex flex-col gap-3 w-full">
            {hasFailedImages && (
              <Button onClick={retryAllFailed} variant="secondary" className="w-full">
                Retry Failed Images
              </Button>
            )}
            {currentImage && (
              <Button variant="primary" onClick={handleDownload} className="w-full">
                Download this picture
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (state.status === 'success' && currentImage) {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-2xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Header */}
          <motion.div variants={staggerItemVariants} className="flex flex-col gap-4">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-1 p-1 rounded-lg hover:bg-neutral-gray-200/20 transition-colors w-fit"
              aria-label="Go back"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-neutral-dark"
              >
                <path
                  d="M8.75 3.5L5.25 7L8.75 10.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Caption variant="2" className="text-neutral-dark">
                Back
              </Caption>
            </button>

            {/* Tribe Badge */}
            <Caption variant="1" className="text-primary text-center uppercase tracking-wider">
              {state.tribe.tribeName}
            </Caption>

            {/* Title and Subtitle */}
            <div className="flex flex-col gap-4">
              <Title variant="h1" className="text-neutral-dark text-center">
                {userName}'s signature moodboard
              </Title>
              <Body variant="1" className="text-neutral-gray text-center">
                A curated visual expression of your subculture.
              </Body>
            </div>
          </motion.div>

          {/* Polaroid Card */}
          <div ref={polaroidRef} className="rounded-lg overflow-hidden w-fit mx-auto">
            <Polaroid
              imageSrc={currentImage.url}
              imageAlt={`Moodboard ${currentImageIndex + 1}`}
              title=""
              subtitle="Tribes & Communities Day"
              className="w-full"
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-6 justify-center items-center">
            <CircleButton
              variant="left"
              ariaLabel="Previous image"
              onClick={previousImage}
              disabled={!canGoPrevious}
              className={!canGoPrevious ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <CircleButton
              variant="right"
              ariaLabel="Next image"
              onClick={nextImage}
              disabled={!canGoNext}
              className={!canGoNext ? 'opacity-50 cursor-not-allowed' : ''}
            />
          </div>

          {/* Download Button */}
          <motion.div variants={staggerItemVariants} className="w-full">
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-[52px] flex items-center justify-center gap-2"
            >
              {isDownloading && <LoaderCircle className="w-5 h-5 animate-spin" />}
              Download Polaroid
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
};
