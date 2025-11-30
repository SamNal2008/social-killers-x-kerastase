export type PageType = 'WelcomePage' | 'NamePage' | 'Step2Page' | 'Step3Page' | 'Step4Page';

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

export interface KeywordsScreenProps {
  onBack: () => void;
  onContinue: (keywords: string[]) => void;
}
