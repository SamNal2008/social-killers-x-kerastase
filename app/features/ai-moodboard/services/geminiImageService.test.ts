import { geminiImageService } from './geminiImageService';
import { supabase } from '~/shared/services/supabase';
import type { GeminiGenerateImageRequest, GeneratedImage } from '../types';

// Mock Supabase
jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('geminiImageService', () => {
  const mockRequest: GeminiGenerateImageRequest = {
    prompt: 'Create a sophisticated moodboard',
    userPhoto: 'data:image/png;base64,mockBase64Data',
    userResultId: 'user-result-123',
    numberOfImages: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateImages', () => {
    it('should successfully generate multiple images', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            images: [
              { url: 'https://example.com/image1.jpg', prompt: 'prompt 1' },
              { url: 'https://example.com/image2.jpg', prompt: 'prompt 2' },
              { url: 'https://example.com/image3.jpg', prompt: 'prompt 3' },
            ],
          },
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      const result = await geminiImageService.generateImages(mockRequest);

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('prompt');
      expect(result[0]).toHaveProperty('timestamp');
    });

    it('should call the correct Edge Function', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            images: [
              { url: 'https://example.com/image1.jpg', prompt: 'prompt 1' },
            ],
          },
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      await geminiImageService.generateImages(mockRequest);

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'generate-image',
        expect.objectContaining({
          body: expect.objectContaining({
            prompt: mockRequest.prompt,
            userPhoto: mockRequest.userPhoto,
            userResultId: mockRequest.userResultId,
            numberOfImages: mockRequest.numberOfImages,
          }),
        })
      );
    });

    it('should throw error when prompt is empty', async () => {
      const invalidRequest = {
        ...mockRequest,
        prompt: '',
      };

      await expect(
        geminiImageService.generateImages(invalidRequest)
      ).rejects.toThrow('Prompt cannot be empty');
    });

    it('should throw error when userPhoto is empty', async () => {
      const invalidRequest = {
        ...mockRequest,
        userPhoto: '',
      };

      await expect(
        geminiImageService.generateImages(invalidRequest)
      ).rejects.toThrow('User photo is required');
    });

    it('should throw error when userResultId is empty', async () => {
      const invalidRequest = {
        ...mockRequest,
        userResultId: '',
      };

      await expect(
        geminiImageService.generateImages(invalidRequest)
      ).rejects.toThrow('User result ID is required');
    });

    it('should throw error when numberOfImages is invalid', async () => {
      const invalidRequest = {
        ...mockRequest,
        numberOfImages: 0,
      };

      await expect(
        geminiImageService.generateImages(invalidRequest)
      ).rejects.toThrow('Number of images must be at least 1');
    });

    it('should handle Edge Function error response', async () => {
      const mockResponse = {
        data: null,
        error: new Error('Function error'),
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        geminiImageService.generateImages(mockRequest)
      ).rejects.toThrow('Failed to generate images');
    });

    it('should handle unsuccessful generation response', async () => {
      const mockResponse = {
        data: {
          success: false,
          error: {
            code: 'GENERATION_FAILED',
            message: 'Image generation failed',
          },
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        geminiImageService.generateImages(mockRequest)
      ).rejects.toThrow('Image generation failed');
    });

    it('should handle missing data in successful response', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: null,
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        geminiImageService.generateImages(mockRequest)
      ).rejects.toThrow('No images returned from generation service');
    });

    it('should generate unique IDs for each image', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            images: [
              { url: 'https://example.com/image1.jpg', prompt: 'prompt 1' },
              { url: 'https://example.com/image2.jpg', prompt: 'prompt 2' },
              { url: 'https://example.com/image3.jpg', prompt: 'prompt 3' },
            ],
          },
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      const result = await geminiImageService.generateImages(mockRequest);

      const ids = result.map((img: GeneratedImage) => img.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include timestamp for each generated image', async () => {
      const beforeTimestamp = Date.now();

      const mockResponse = {
        data: {
          success: true,
          data: {
            images: [
              { url: 'https://example.com/image1.jpg', prompt: 'prompt 1' },
            ],
          },
        },
        error: null,
      };

      (supabase.functions.invoke as jest.Mock).mockResolvedValue(mockResponse);

      const result = await geminiImageService.generateImages(mockRequest);

      const afterTimestamp = Date.now();

      expect(result[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(result[0].timestamp).toBeLessThanOrEqual(afterTimestamp);
    });
  });
});
