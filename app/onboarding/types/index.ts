import type { Tables } from '~/shared/types/database.types';
import type { Moodboard } from '~/shared/services/moodboardService';

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
  moodboards: Moodboard[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
}

export interface FormHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
}

export interface NameScreenProps {
  onBack: () => void;
  onContinue: (name: string) => void;
  isLoading?: boolean;
}

export interface KeywordsScreenProps {
  onBack: () => void;
  onContinue: (keywords: string[]) => void;
  keywords: Tables<'keywords'>[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
}

export interface TinderScreenProps {
  onBack: () => void;
  onContinue: (liked: string[], passed: string[]) => void;
  brands: Tables<'brands'>[];
}

export type Brand = string;
