import { imagePollingService } from './imagePollingService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('imagePollingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pollGeneratedImages', () => {
    it('should return empty array when no images are generated yet', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const result = await imagePollingService.pollGeneratedImages('user-123');

      expect(result).toEqual({
        images: [],
        isComplete: false,
      });
      expect(supabase.from).toHaveBeenCalledWith('generated_images');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_result_id', 'user-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should return images ordered by creation time', async () => {
      const mockImages = [
        {
          id: 'img-1',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image1.jpg',
          prompt: 'First image prompt',
          created_at: '2025-12-04T10:00:00Z',
          image_index: 0,
          is_primary: true,
        },
        {
          id: 'img-2',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image2.jpg',
          prompt: 'Second image prompt',
          created_at: '2025-12-04T10:01:00Z',
          image_index: 1,
          is_primary: false,
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const result = await imagePollingService.pollGeneratedImages('user-123');

      expect(result).toEqual({
        images: [
          {
            id: 'img-1',
            url: 'https://example.com/image1.jpg',
            prompt: 'First image prompt',
            timestamp: new Date('2025-12-04T10:00:00Z').getTime(),
          },
          {
            id: 'img-2',
            url: 'https://example.com/image2.jpg',
            prompt: 'Second image prompt',
            timestamp: new Date('2025-12-04T10:01:00Z').getTime(),
          },
        ],
        isComplete: false,
      });
    });

    it('should return isComplete true when all 3 images are generated', async () => {
      const mockImages = [
        {
          id: 'img-1',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image1.jpg',
          prompt: 'First image prompt',
          created_at: '2025-12-04T10:00:00Z',
          image_index: 0,
          is_primary: true,
        },
        {
          id: 'img-2',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image2.jpg',
          prompt: 'Second image prompt',
          created_at: '2025-12-04T10:01:00Z',
          image_index: 1,
          is_primary: false,
        },
        {
          id: 'img-3',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image3.jpg',
          prompt: 'Third image prompt',
          created_at: '2025-12-04T10:02:00Z',
          image_index: 2,
          is_primary: false,
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const result = await imagePollingService.pollGeneratedImages('user-123');

      expect(result.isComplete).toBe(true);
      expect(result.images).toHaveLength(3);
    });

    it('should throw error when Supabase query fails', async () => {
      const mockError = new Error('Database connection failed');
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: null,
        error: mockError,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      await expect(
        imagePollingService.pollGeneratedImages('user-123')
      ).rejects.toThrow('Failed to fetch generated images: Database connection failed');
    });

    it('should handle null created_at timestamps gracefully', async () => {
      const mockImages = [
        {
          id: 'img-1',
          user_result_id: 'user-123',
          image_url: 'https://example.com/image1.jpg',
          prompt: 'First image prompt',
          created_at: null,
          image_index: 0,
          is_primary: true,
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockImages,
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any);

      const result = await imagePollingService.pollGeneratedImages('user-123');

      expect(result.images[0].timestamp).toBe(Date.now());
    });

    it('should validate userResultId is not empty', async () => {
      await expect(
        imagePollingService.pollGeneratedImages('')
      ).rejects.toThrow('userResultId cannot be empty');
    });
  });
});
