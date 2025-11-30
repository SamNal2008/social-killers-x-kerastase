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
  const [formData, setFormData] = useState({ name: '' });
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });

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

  const handleBack = () => {
    goToPreviousPage();
    setDirection('backward');
  };

  const handleNameContinue = async (name: string) => {
    const userId = localStorageUtils.getUserId();

    if (!userId) {
      console.error('No user ID found in localStorage');
      return;
    }

    setLoadingState({ status: 'loading' });

    try {
      const updatedUser = await userService.update(userId, name);

      // Save user name to localStorage
      localStorageUtils.setUserName(name);

      // Update step progress
      goToNextPage();

      setFormData({ name });
      setLoadingState({ status: 'success', user: updatedUser });
      setDirection('forward');
    } catch (error) {
      const appError = error instanceof Error
        ? error
        : new Error('Failed to update user name');

      setLoadingState({ status: 'error', error: appError });
    }
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

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentPage === 'NamePage' ? (
        <motion.div
          key="name"
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionVariants}
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
          transition={pageTransitionVariants}
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
