import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import type { FormStep } from '../onboarding/types';
import type { Tables } from '~/shared/types/database.types';
import { userService } from '~/shared/services/userService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kérastase Experience" },
    { name: "description", content: "Discover your subculture with Kérastase" },
  ];
}

type User = Tables<'users'>;

type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; user: User }
  | { status: 'error'; error: Error };

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState({ name: '' });
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });

  const isLoading = loadingState.status === 'loading';
  const isError = loadingState.status === 'error';

  const handleBeginExperience = async (): Promise<void> => {
    // Prevent multiple clicks using ref for immediate check
    if (isLoading) {
      return;
    }
    setLoadingState({ status: 'loading' });

    try {
      const user = await userService.create();
      setLoadingState({ status: 'success', user });
      setDirection('forward');
      setCurrentStep('name');
    } catch (error) {
      const appError = error instanceof Error
        ? error
        : new Error('An unexpected error occurred');

      setLoadingState({ status: 'error', error: appError });
    }
  };

  const handleBack = () => {
    setDirection('backward');
    setCurrentStep('welcome');
  };

  const handleNameContinue = (name: string) => {
    setFormData({ name });
    // For now, Continue button doesn't navigate anywhere
    // This will be implemented when we add the next step
  };

  const pageVariants = {
    initial: (direction: 'forward' | 'backward') => ({
      opacity: 0,
      x: direction === 'forward' ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: 'forward' | 'backward') => ({
      opacity: 0,
      x: direction === 'forward' ? -30 : 30,
    }),
  };

  const pageTransition = {
    duration: 0.35,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number], // Custom easing for premium feel
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentStep === 'name' ? (
        <motion.div
          key="name"
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <NameScreen
            onBack={handleBack}
            onContinue={handleNameContinue}
          />
        </motion.div>
      ) : (
        <motion.div
          key="welcome"
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <Welcome
    onBeginExperience={handleBeginExperience}
    isLoading={isLoading}
    isError={isError}
    error={isError ? loadingState.error : undefined}
  />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
