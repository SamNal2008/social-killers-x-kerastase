import { tribeService } from './tribeService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('tribeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTribeByUserResultId', () => {
    it('returns tribe details when user result exists', async () => {
      const mockUserResultId = 'user-result-123';

      const mockResponse = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: mockUserResultId,
            tribe: {
              id: 'tribe-456',
              name: 'Heritage Heiress',
              subtitle: 'You make timeless elegance your own.',
              text: 'You have a deep appreciation for heritage.',
              dos: ['Choose quality over quantity'],
              donts: ['Overcomplicate choices'],
            },
          },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockResponse);

      const result = await tribeService.fetchTribeByUserResultId(mockUserResultId);

      expect(result).toEqual({
        id: 'tribe-456',
        name: 'Heritage Heiress',
        subtitle: 'You make timeless elegance your own.',
        description: 'You have a deep appreciation for heritage.',
        dos: ['Choose quality over quantity'],
        donts: ['Overcomplicate choices'],
        userResultId: mockUserResultId,
      });

      expect(supabase.from).toHaveBeenCalledWith('user_results');
    });

    it('throws an error when user result is missing', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        tribeService.fetchTribeByUserResultId('missing-id')
      ).rejects.toThrow('Failed to fetch user result: Not found');
    });

    it('throws an error when tribe data is missing', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'user-result-123',
            tribe: null,
          },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        tribeService.fetchTribeByUserResultId('user-result-123')
      ).rejects.toThrow('No tribe found for this user result');
    });

    it('defaults to empty arrays when dos or donts are not arrays', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'user-result-123',
            tribe: {
              id: 'tribe-456',
              name: 'Quiet Luxury',
              subtitle: 'You thrive on quality, not showiness.',
              text: 'Experiences matter more than possessions.',
              dos: 'not-an-array',
              donts: null,
            },
          },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await tribeService.fetchTribeByUserResultId('user-result-123');

      expect(result.dos).toEqual([]);
      expect(result.donts).toEqual([]);
    });
  });
});
