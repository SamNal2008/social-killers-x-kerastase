import { useState } from 'react';
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { NameScreen } from '../onboarding/components/NameScreen';
import type { FormStep } from '../onboarding/types';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kérastase Experience" },
    { name: "description", content: "Discover your subculture with Kérastase" },
  ];
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FormStep>('welcome');
  const [formData, setFormData] = useState({ name: '' });

  const handleBeginExperience = () => {
    setCurrentStep('name');
  };

  const handleBack = () => {
    setCurrentStep('welcome');
  };

  const handleNameContinue = (name: string) => {
    setFormData({ name });
    // For now, Continue button doesn't navigate anywhere
    // This will be implemented when we add the next step
  };

  if (currentStep === 'name') {
    return (
      <NameScreen
        onBack={handleBack}
        onContinue={handleNameContinue}
      />
    );
  }

  return <Welcome onBeginExperience={handleBeginExperience} />;
}
