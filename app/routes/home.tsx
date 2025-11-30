import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import { KeywordsScreen } from '../onboarding/components/KeywordsScreen';
import type { FormStep } from '../onboarding/types';
import { pageTransitionVariants, pageTransitionConfig } from '~/shared/animations/transitions';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kérastase Experience" },
    { name: "description", content: "Discover your subculture with Kérastase" },
  ];
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState({ name: '', keywords: [] as string[] });

  const handleBeginExperience = () => {
    setDirection('forward');
    setCurrentStep('name');
  };

  const handleBackToWelcome = () => {
    setDirection('backward');
    setCurrentStep('welcome');
  };

  const handleNameContinue = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));
    setDirection('forward');
    setCurrentStep('step3'); // Navigate to keywords screen
  };

  const handleBackToName = () => {
    setDirection('backward');
    setCurrentStep('name');
  };

  const handleKeywordsContinue = (keywords: string[]) => {
    setFormData((prev) => ({ ...prev, keywords }));
    // For now, Continue button doesn't navigate anywhere
    // This will be implemented when we add the next step
    console.log('Selected keywords:', keywords);
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentStep === 'step3' ? (
        <motion.div
          key="keywords"
          custom={direction}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionConfig}
        >
          <KeywordsScreen
            onBack={handleBackToName}
            onContinue={handleKeywordsContinue}
          />
        </motion.div>
      ) : currentStep === 'name' ? (
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
          transition={pageTransitionConfig}
        >
          <Welcome onBeginExperience={handleBeginExperience} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
