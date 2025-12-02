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
 * AI Moodboard state using discriminated union pattern
 * Ensures type safety and prevents invalid state combinations
 */
export type AiMoodboardState =
  | { status: 'idle' }
  | { status: 'loading-tribe' }
  | { status: 'generating' }
  | { status: 'success'; images: GeneratedImage[]; tribe: TribePromptData }
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
