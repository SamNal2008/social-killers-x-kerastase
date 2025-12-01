import type { FC } from 'react';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/shared/components/Button/Button';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { useCamera } from '../hooks/useCamera';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';

export const CameraScreen: FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { state, capturedPhoto, requestCameraAccess, stopCamera, capturePhoto, retakePhoto } = useCamera();

  useEffect(() => {
    // Request camera access on mount
    requestCameraAccess();
    // Cleanup is handled by the useCamera hook
  }, [requestCameraAccess]);

  useEffect(() => {
    // Attach stream to video element when camera becomes active
    if (state.status === 'active' && videoRef.current) {
      videoRef.current.srcObject = state.stream;
    }
  }, [state]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCapture = async () => {
    if (videoRef.current) {
      await capturePhoto(videoRef.current);
    }
  };

  const handleRetake = () => {
    retakePhoto();
  };

  // Browser doesn't support camera
  if (state.status === 'unsupported') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItemVariants}>
            <Button
              variant="tertiary"
              onClick={handleBack}
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          </motion.div>

          <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
            <motion.div variants={staggerItemVariants}>
              <Title variant="h2" className="text-neutral-dark text-center">
                Camera not supported
              </Title>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Body variant="1" className="text-neutral-gray text-center max-w-[322px]">
                Your browser does not support camera access. Please try using a different browser like Chrome, Safari, or Firefox.
              </Body>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Permission denied
  if (state.status === 'denied') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItemVariants}>
            <Button
              variant="tertiary"
              onClick={handleBack}
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          </motion.div>

          <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
            <motion.div variants={staggerItemVariants}>
              <Title variant="h2" className="text-neutral-dark text-center">
                Camera access denied
              </Title>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Body variant="1" className="text-neutral-gray text-center max-w-[322px]">
                We need camera access to take your selfie. Please enable camera permissions in your browser settings and try again.
              </Body>
            </motion.div>
            <motion.div variants={staggerItemVariants} className="w-full">
              <Button
                variant="primary"
                onClick={requestCameraAccess}
                className="w-full h-[52px]"
              >
                Try again
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItemVariants}>
            <Button
              variant="tertiary"
              onClick={handleBack}
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          </motion.div>

          <div className="flex flex-col gap-6 items-center justify-center min-h-[400px]">
            <motion.div variants={staggerItemVariants}>
              <Title variant="h2" className="text-neutral-dark text-center">
                Camera error
              </Title>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Body variant="1" className="text-neutral-gray text-center max-w-[322px]">
                {state.error.message}
              </Body>
            </motion.div>
            <motion.div variants={staggerItemVariants} className="w-full">
              <Button
                variant="primary"
                onClick={requestCameraAccess}
                className="w-full h-[52px]"
              >
                Try again
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading/requesting state
  if (state.status === 'idle' || state.status === 'requesting') {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Body variant="1" className="text-neutral-gray">
          Requesting camera access...
        </Body>
      </div>
    );
  }

  // Show captured photo
  if (capturedPhoto) {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        <motion.div
          className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItemVariants}>
            <Button
              variant="tertiary"
              onClick={handleBack}
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          </motion.div>

          <div className="flex flex-col gap-6 w-full">
            <motion.div variants={staggerItemVariants}>
              <Title variant="h2" className="text-neutral-dark text-center">
                Your selfie
              </Title>
            </motion.div>

            <motion.div variants={staggerItemVariants} className="w-full">
              <img
                src={capturedPhoto.dataUrl}
                alt="Captured selfie"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>

            <motion.div variants={staggerItemVariants} className="w-full">
              <Button
                variant="primary"
                onClick={handleRetake}
                className="w-full h-[52px]"
              >
                Retake photo
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Camera preview (active state)
  return (
    <div className="bg-surface-light min-h-screen p-6 md:p-8">
      <motion.div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Back Button */}
        <motion.div variants={staggerItemVariants}>
          <Button
            variant="tertiary"
            onClick={handleBack}
            type="button"
            aria-label="Back"
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </motion.div>

        {/* Content */}
        <div className="flex flex-col gap-12 w-full">
          {/* Header with Title and Subtitle */}
          <div className="flex flex-col gap-4 w-full">
            <motion.div variants={staggerItemVariants}>
              <Title variant="h1" className="text-neutral-dark text-center">
                Take a selfie
              </Title>
            </motion.div>
            <motion.div variants={staggerItemVariants}>
              <Body variant="1" className="text-neutral-gray text-center">
                We'll generate a personalized moodboard based on your tribe.
              </Body>
            </motion.div>
          </div>

          {/* Camera Preview with Capture Button */}
          <motion.div variants={staggerItemVariants} className="relative w-full">
            <div className="relative w-full h-[592px] bg-neutral-dark rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />

              {/* Circular Capture Button */}
              <button
                onClick={handleCapture}
                aria-label="Capture photo"
                className="absolute bottom-[52px] left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-[1.5px] border-white/30 flex items-center justify-center bg-transparent hover:border-white/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-white" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
