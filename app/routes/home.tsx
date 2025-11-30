import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import type { Tables } from '~/shared/types/database.types';
import { userService } from '~/shared/services/userService';
import { localStorageUtils } from '~/shared/utils/localStorage';
import { useStepStore } from '~/shared/stores/stepStore';
import { pageTransitionVariants } from '~/shared/animations/transitions';
import { KeywordsScreen } from '~/onboarding/components/KeywordsScreen';

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
  const { currentPage, goToPreviousPage, goToNextPage } = useStepStore();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [formData, setFormData] = useState({ name: '', keywords: [] as string[] });

  const isLoading = loadingState.status === 'loading';
  const isError = loadingState.status === 'error';


  const createUser = async (): Promise<void> => {
    setLoadingState({ status: 'loading' });

    try {
      const user = await userService.create();
      localStorageUtils.setUserId(user.id);
      setLoadingState({ status: 'success', user });
    } catch (error) {
      const appError = error instanceof Error
        ? error
        : new Error('An unexpected error occurred');

      setLoadingState({ status: 'error', error: appError });
    }
  };

  const handleBeginExperience = async (): Promise<void> => {
    // Prevent multiple clicks using ref for immediate check
    if (isLoading) {
      return;
    }
    setLoadingState({ status: 'loading' });

    try {
      await createUser();
      setDirection('forward');
      goToNextPage();
    } catch (error) {
      const appError = error instanceof Error
        ? error
        : new Error('An unexpected error occurred');

      setLoadingState({ status: 'error', error: appError });
    }
  };

  const handleBackToWelcome = () => {
    setDirection('backward');
    goToPreviousPage();
  };

  const handleNameContinue = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setDirection('forward');
    goToNextPage();
  };

  const handleBackToName = () => {
    setDirection('backward');
    goToPreviousPage();
  };

  const handleKeywordsContinue = (keywords: string[]) => {
    setFormData((prev) => ({ ...prev, keywords }));
    // For now, Continue button doesn't navigate anywhere
    // This will be implemented when we add the next step
    console.log('Selected keywords:', keywords);
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentPage === 'Step3Page' ? (
        <motion.div
          key="keywords"
          custom={direction}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionVariants}
        >
          <KeywordsScreen
            onBack={handleBackToName}
            onContinue={handleKeywordsContinue}
          />
        </motion.div>
      ) : currentPage === 'NamePage' ? (
        <motion.div
          key="name"
          custom={direction}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionVariants}
        >
          <NameScreen
            onBack={handleBackToWelcome}
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
          transition={pageTransitionVariants}
        >
          <Welcome
            onBeginExperience={handleBeginExperience}
            isLoading={isLoading}
            isError={isError}
            error={isError ? loadingState.error : undefined}
          />
        </motion.div>
      )
      }
    </AnimatePresence >
  );
}
