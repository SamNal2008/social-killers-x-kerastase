import { dashboardService } from './dashboardService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('dashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserResults', () => {
    it('should fetch user results with joins successfully', async () => {
      const mockData = [
        {
          id: 'result-1',
          user_id: 'user-1',
          tribe_id: 'tribe-1',
          generated_image_url: 'https://example.com/image1.jpg',
          created_at: '2024-12-02T10:42:00Z',
          users: {
            name: 'Romain Lagrange',
          },
          tribes: {
            tribe_subcultures: [
              {
                subcultures: {
                  name: 'Functionals',
                },
              },
            ],
          },
          generated_images: [
            { image_url: 'https://example.com/image1.jpg', image_index: 0 },
            { image_url: 'https://example.com/image1-alt.jpg', image_index: 1 },
          ],
        },
        {
          id: 'result-2',
          user_id: 'user-2',
          tribe_id: 'tribe-2',
          generated_image_url: 'https://example.com/image2.jpg',
          created_at: '2024-12-02T10:45:00Z',
          users: {
            name: 'Jane Doe',
          },
          tribes: {
            tribe_subcultures: [
              {
                subcultures: {
                  name: 'Creatives',
                },
              },
            ],
          },
          generated_images: [
            { image_url: 'https://example.com/image2.jpg', image_index: 0 },
            { image_url: 'https://example.com/image2-alt.jpg', image_index: 1 },
          ],
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        not: mockNot,
      });

      mockNot.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const results = await dashboardService.getUserResults();

      expect(supabase.from).toHaveBeenCalledWith('user_results');
      expect(mockSelect).toHaveBeenCalledWith(`
        id,
        user_id,
        tribe_id,
        generated_image_url,
        created_at,
        users(name),
        tribes(
          tribe_subcultures(
            subcultures(name)
          )
        ),
        generated_images(image_url, image_index)
      `);
      expect(mockNot).toHaveBeenCalledWith('generated_image_url', 'is', null);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockLimit).toHaveBeenCalledWith(20);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'result-1',
        userId: 'user-1',
        userName: 'Romain Lagrange',
        tribeId: 'tribe-1',
        subcultureName: 'Functionals',
        generatedImageUrl: 'https://example.com/image1.jpg',
        imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image1-alt.jpg'],
        createdAt: '2024-12-02T10:42:00Z',
      });
    });

    it('should throw error when database query fails', async () => {
      const mockError = { message: 'Database connection failed' };

      const mockSelect = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: null, error: mockError });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        not: mockNot,
      });

      mockNot.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      await expect(dashboardService.getUserResults()).rejects.toThrow(
        'Failed to fetch dashboard user results: Database connection failed'
      );
    });

    it('should return empty array when no results found', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        not: mockNot,
      });

      mockNot.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const results = await dashboardService.getUserResults();

      expect(results).toEqual([]);
    });

    it('should handle missing user or subculture data gracefully', async () => {
      const mockData = [
        {
          id: 'result-1',
          user_id: 'user-1',
          tribe_id: 'tribe-1',
          generated_image_url: 'https://example.com/image1.jpg',
          created_at: '2024-12-02T10:42:00Z',
          users: null,
          tribes: {
            tribe_subcultures: [
              {
                subcultures: {
                  name: 'Functionals',
                },
              },
            ],
          },
          generated_images: [],
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockNot = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        not: mockNot,
      });

      mockNot.mockReturnValue({
        order: mockOrder,
      });

      mockOrder.mockReturnValue({
        limit: mockLimit,
      });

      const results = await dashboardService.getUserResults();

      expect(results).toHaveLength(1);
      expect(results[0].userName).toBe('Unknown');
    });
  });

  describe('deleteResult', () => {
    it('should delete result successfully when it exists', async () => {
      const resultId = 'result-1';

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: resultId }, error: null });
      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          delete: mockDelete,
        });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockDelete.mockReturnValue({
        eq: mockDeleteEq,
      });

      await dashboardService.deleteResult(resultId);

      expect(supabase.from).toHaveBeenCalledWith('user_results');
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockEq).toHaveBeenCalledWith('id', resultId);
      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteEq).toHaveBeenCalledWith('id', resultId);
    });

    it('should throw ResultNotFoundError when result does not exist', async () => {
      const resultId = 'non-existent-result';

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      await expect(dashboardService.deleteResult(resultId)).rejects.toThrow(
        'Result not found'
      );
    });

    it('should throw error when database query fails', async () => {
      const resultId = 'result-1';

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { id: resultId }, error: null });
      const mockDelete = jest.fn().mockReturnThis();
      const mockDeleteEq = jest.fn().mockResolvedValue({
        error: { message: 'Database connection failed' },
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
        })
        .mockReturnValueOnce({
          delete: mockDelete,
        });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      mockEq.mockReturnValue({
        single: mockSingle,
      });

      mockDelete.mockReturnValue({
        eq: mockDeleteEq,
      });

      await expect(dashboardService.deleteResult(resultId)).rejects.toThrow(
        'Failed to delete result: Database connection failed'
      );
    });
  });
});
