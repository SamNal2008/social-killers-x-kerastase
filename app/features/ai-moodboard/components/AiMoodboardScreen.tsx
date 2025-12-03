import type { FC } from 'react';
import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { useAiMoodboard } from '../hooks/useAiMoodboard';
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
    nextImage,
    previousImage,
    downloadImage,
    downloadPolaroid,
    isDownloading,
    isImageReady,
    handleImageReady,
    canGoNext,
    canGoPrevious,
  } = useAiMoodboard({ userResultId, userPhoto });

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownload = async () => {
    if (polaroidRef.current && state.status === 'success') {
      try {
        const subcultureName = state.tribe.subcultureName.toLowerCase().replace(/\s+/g, '-');
        const filename = `${userName}-polaroid-${subcultureName}.png`;
        await downloadPolaroid(polaroidRef.current, filename);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Failed to download polaroid. Please try again.');
      }
    }
  };


  // Loading state
  if (state.status === 'idle' || state.status === 'loading-tribe' || state.status === 'generating') {
    return (
      <div className="bg-surface-light min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <Body variant="1" className="text-neutral-gray text-center">
            {state.status === 'loading-tribe' && 'Loading your tribe...'}
            {state.status === 'generating' && 'Generating your personalized moodboard...'}
            {state.status === 'idle' && 'Initializing...'}
          </Body>
        </div>
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
          <Button onClick={handleBack}>
            Go Back
          </Button>
        </div>
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

          {/* Content */}
          <div className="flex flex-col gap-6 w-full">
            {/* Polaroid Card */}
            <motion.div variants={staggerItemVariants}>
              {/* Wrapper with background to ensure white frame is captured */}
              <div ref={polaroidRef} style={{ backgroundColor: '#F5F5F5', padding: '20px', borderRadius: '12px' }}>
                <Polaroid
                  imageSrc={currentImage.url}
                  imageAlt={`Moodboard ${currentImageIndex + 1}`}
                  title=""
                  subtitle="Tribes & Communities Day"
                  className="w-full"
                  onImageLoad={handleImageReady}
                />
              </div>
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              variants={staggerItemVariants}
              className="flex gap-6 justify-center items-center"
            >
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
            </motion.div>

            {/* Download Button */}
            <motion.div variants={staggerItemVariants} className="w-full">
              <Button
                variant="primary"
                onClick={handleDownload}
                disabled={isDownloading || !isImageReady}
                className="w-full h-[52px] flex items-center justify-center gap-2"
              >
                {isDownloading && <LoaderCircle className="w-5 h-5 animate-spin" />}
                {!isImageReady && !isDownloading ? 'Preparing image...' : 'Download Polaroid'}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
};
