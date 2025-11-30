import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import { TinderScreen } from '../onboarding/components/TinderScreen';
import { KeywordsScreen } from '../onboarding/components/KeywordsScreen';
import type { FormStep, FormData } from '../onboarding/types';
import { pageTransitionVariants, pageTransitionConfig } from '~/shared/animations/transitions';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Kérastase Experience" },
    { name: "description", content: "Discover your subculture with Kérastase" },
  ];
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    keywords: [],
    brands: { liked: [], passed: [] }
  });

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
    setCurrentStep('keywords');
  };

  const handleBackToName = () => {
    setDirection('backward');
    setCurrentStep('name');
  };

  const handleKeywordsContinue = (keywords: string[]) => {
    setFormData((prev) => ({ ...prev, keywords }));
    setDirection('forward');
    setCurrentStep('tinder');
  };

  const handleBackToKeywords = () => {
    setDirection('backward');
    setCurrentStep('keywords');
    // Reset brands when going back
    setFormData((prev) => ({
      ...prev,
      brands: { liked: [], passed: [] }
    }));
  };

  const handleTinderContinue = (liked: string[], passed: string[]) => {
    setFormData((prev) => ({
      ...prev,
      brands: { liked, passed }
    }));
    // Next step implementation coming soon
    console.log('Finished onboarding:', { ...formData, brands: { liked, passed } });
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      {currentStep === 'tinder' ? (
        <motion.div
          key="tinder"
          custom={direction}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransitionConfig}
        >
          <TinderScreen
            onBack={handleBackToKeywords}
            onContinue={handleTinderContinue}
          />
        </motion.div>
      ) : currentStep === 'keywords' ? (
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
