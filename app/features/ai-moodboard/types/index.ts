/**
 * AI Moodboard Feature Types
 * Manages state and data for AI-generated moodboard images
 */

/**
 * Generated image data structure
 */
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

/**
 * Image generation status for each slot
 */
export type ImageSlotStatus = 'pending' | 'generating' | 'ready' | 'error';

/**
 * Individual image slot state
 */
export interface ImageSlot {
  status: ImageSlotStatus;
  image?: GeneratedImage;
  error?: Error;
}

/**
 * AI Moodboard state using discriminated union pattern
 * Ensures type safety and prevents invalid state combinations
 */
export type AiMoodboardState =
  | { status: 'idle' }
  | { status: 'loading-tribe' }
  | { status: 'generating'; imageSlots: [ImageSlot, ImageSlot, ImageSlot]; tribe: TribePromptData }
  | { status: 'complete'; images: GeneratedImage[]; tribe: TribePromptData }
  | { status: 'error'; error: Error };

/**
 * Tribe data needed for prompt generation
 */
export interface TribePromptData {
  tribeId: string;
  tribeName: string;
  subcultureName: string;
  keywords: string[];
}

/**
 * Request for Gemini image generation
 */
export interface GeminiGenerateImageRequest {
  userPhoto: string; // Base64 encoded image
  userResultId: string;
  numberOfImages: number;
}

/**
 * Response from Gemini image generation Edge Function
 */
export interface GeminiGenerateImageResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      prompt: string;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Return type for useAiMoodboard hook
 */
export interface UseAiMoodboardReturn {
  state: AiMoodboardState;
  currentImageIndex: number;
  currentImage: GeneratedImage | null;
  nextImage: () => void;
  previousImage: () => void;
  downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
  downloadPolaroid: (element: HTMLElement, filename?: string) => Promise<void>;
  isDownloading: boolean;
  isImageReady: boolean;
  handleImageReady: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  retryGeneration: () => void;
}

