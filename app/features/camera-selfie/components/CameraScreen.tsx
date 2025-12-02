import type { FC } from 'react';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Title } from '~/shared/components/Typography/Title';
import { Body } from '~/shared/components/Typography/Body';
import { useCamera } from '../hooks/useCamera';
import { localStorageUtils } from '~/shared/utils/localStorage';
import { staggerContainerVariants, staggerItemVariants } from '~/shared/animations/transitions';
import { CameraErrorScreen } from './CameraErrorScreen';
import { CameraResultSelfie } from './CameraResultSelfie';
import { CameraBackButton } from './CameraBackButton';

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

  const handleContinue = async () => {
    if (!capturedPhoto) return;

    const userResultId = localStorageUtils.getUserResultId();
    const userName = localStorageUtils.getUserName();

    if (!userResultId) {
      console.error('No user result ID found');
      alert('Error: User result not found. Please complete the questionnaire first.');
      return;
    }

    // Navigate to AI moodboard screen
    navigate('/ai-moodboard', {
      state: {
        userPhoto: capturedPhoto.dataUrl,
        userResultId,
        userName,
      },
    });
  };

  // Auto-trigger navigation after photo capture
  useEffect(() => {
    if (capturedPhoto) {
      // Small delay to show the captured photo briefly before navigating
      const timer = setTimeout(() => {
        handleContinue();
      }, 500); // 500ms delay for better UX

      return () => clearTimeout(timer);
    }
  }, [capturedPhoto]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser doesn't support camera
  if (state.status === 'unsupported') {
    return (
      <CameraErrorScreen
        variant="unsupported"
        onBack={handleBack}
      />
    );
  }

  // Permission denied
  if (state.status === 'denied') {
    return (
      <CameraErrorScreen
        variant="denied"
        onBack={handleBack}
        onRetry={requestCameraAccess}
      />
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <CameraErrorScreen
        variant="error"
        message={state.error.message}
        onBack={handleBack}
        onRetry={requestCameraAccess}
      />
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

  // Show captured photo with auto-navigation message
  if (capturedPhoto) {
    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Loading Spinner */}
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />

          {/* Message */}
          <Body variant="1" className="text-neutral-gray text-center">
            Generating your personalized moodboard...
          </Body>
        </div>
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
        <CameraBackButton onClick={handleBack} />

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
