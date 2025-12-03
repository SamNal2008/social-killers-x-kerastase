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
  imageIndex: number;
}

/**
 * Image slot state for progressive loading
 */
export type ImageSlotState =
  | { status: 'pending' }
  | { status: 'loading' }
  | { status: 'success'; image: GeneratedImage }
  | { status: 'error'; error: ImageGenerationError };

/**
 * Error types for image generation
 */
export type ImageGenerationErrorCode =
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'GENERATION_FAILED'
  | 'UPLOAD_FAILED'
  | 'UNKNOWN';

export interface ImageGenerationError {
  code: ImageGenerationErrorCode;
  message: string;
  isRetryable: boolean;
}

/**
 * AI Moodboard state using discriminated union pattern
 * Ensures type safety and prevents invalid state combinations
 */
export type AiMoodboardState =
  | { status: 'idle' }
  | { status: 'loading-tribe' }
  | { status: 'generating'; imageSlots: ImageSlotState[]; tribe: TribePromptData }
  | { status: 'success'; images: GeneratedImage[]; tribe: TribePromptData }
  | { status: 'partial-success'; images: GeneratedImage[]; failedSlots: number[]; tribe: TribePromptData; error: ImageGenerationError }
  | { status: 'error'; error: ImageGenerationError };

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
      imageIndex: number;
    }>;
    userResultId: string;
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
  canGoNext: boolean;
  canGoPrevious: boolean;
}

/**
 * Response for single image generation
 */
export interface GeminiGenerateSingleImageResponse {
  success: boolean;
  data?: {
    imageUrl: string;
    prompt: string;
    imageIndex: number;
    userResultId: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Database record for generated image
 */
export interface GeneratedImageRecord {
  id: string;
  user_result_id: string;
  image_url: string;
  prompt: string;
  image_index: number;
  is_primary: boolean;
  created_at: string;
}

/**
 * Maps error codes from edge function to frontend error types
 */
export const mapErrorCodeToType = (code: string): ImageGenerationErrorCode => {
  switch (code) {
    case 'RATE_LIMITED':
    case 'TOO_MANY_REQUESTS':
      return 'RATE_LIMITED';
    case 'INTERNAL_ERROR':
    case 'DATABASE_ERROR':
    case 'CONFIGURATION_ERROR':
    case 'SERVER_ERROR':
      return 'SERVER_ERROR';
    case 'NETWORK_ERROR':
      return 'NETWORK_ERROR';
    case 'INVALID_REQUEST':
    case 'INVALID_JSON':
    case 'METHOD_NOT_ALLOWED':
      return 'INVALID_REQUEST';
    case 'GENERATION_FAILED':
      return 'GENERATION_FAILED';
    case 'UPLOAD_FAILED':
      return 'UPLOAD_FAILED';
    default:
      return 'UNKNOWN';
  }
};

export const isRetryableError = (code: ImageGenerationErrorCode): boolean => {
  return code === 'RATE_LIMITED' || code === 'SERVER_ERROR' || code === 'NETWORK_ERROR';
};
