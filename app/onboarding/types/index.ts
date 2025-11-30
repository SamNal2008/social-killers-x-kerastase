export type FormStep = 'welcome' | 'name' | 'step2' | 'step3' | 'step4';

export interface FormData {
  name: string;
  // More fields will be added for future steps
}

export interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export interface NameScreenProps {
  onBack: () => void;
  onContinue: (name: string) => void;
}
