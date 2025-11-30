import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import type { FormStep } from '../onboarding/types';
import type { Tables } from '~/shared/types/database.types';
import { userService } from '~/shared/services/userService';
import { pageTransitionVariants, pageTransitionConfig } from '~/shared/animations/transitions';

export function meta({ }: Route.MetaArgs) {
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

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentStep === 'name' ? (
        <motion.div
          key="name"
          custom={direction}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionConfig}
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
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionConfig}
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
