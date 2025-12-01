export type PageType = 'WelcomePage' | 'NamePage' | 'KeywordPage' | 'TinderPage' | 'MoodboardPage' | 'ResultsPage';

export interface FormData {
  name: string;
  keywords: string[];
  brands?: {
    liked: string[];
    passed: string[];
  };
  moodboard?: string;
}

export interface MoodboardScreenProps {
  onBack: () => void;
  onContinue: (moodboardId: string) => void;
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

export interface TinderScreenProps {
  onBack: () => void;
  onContinue: (liked: string[], passed: string[]) => void;
}

export type Brand = string;
