import { subcultureService } from './subcultureService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('subcultureService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSubcultureByUserResultId', () => {
    it('should fetch subculture data successfully', async () => {
      const mockUserResultId = 'user-result-123';
      const mockTribeId = 'tribe-456';
      const mockSubcultureId = 'subculture-789';

      const mockUserResult = {
        id: mockUserResultId,
        tribe_id: mockTribeId,
      };

      const mockTribeSubculture = {
        subculture_id: mockSubcultureId,
        subculture: {
          id: mockSubcultureId,
          name: 'Functionals',
          description: 'Understated refinement is your signature. You appreciate beauty in discretion, favoring quality over volume.',
        },
      };

      const mockUserResultQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUserResult,
          error: null,
        }),
      };

      const mockTribeSubcultureQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTribeSubculture,
          error: null,
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockUserResultQuery)
        .mockReturnValueOnce(mockTribeSubcultureQuery);

      const result = await subcultureService.fetchSubcultureByUserResultId(mockUserResultId);

      expect(result).toEqual({
        id: mockSubcultureId,
        name: 'Functionals',
        description: 'Understated refinement is your signature. You appreciate beauty in discretion, favoring quality over volume.',
        userResultId: mockUserResultId,
      });

      expect(supabase.from).toHaveBeenCalledWith('user_results');
      expect(supabase.from).toHaveBeenCalledWith('tribe_subcultures');
    });

    it('should throw error if userResultId not found', async () => {
      const mockUserResultId = 'non-existent-id';

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
        subcultureService.fetchSubcultureByUserResultId(mockUserResultId)
      ).rejects.toThrow('Failed to fetch user result');
    });

    it('should throw error if tribe has no subculture', async () => {
      const mockUserResultId = 'user-result-123';
      const mockTribeId = 'tribe-456';

      const mockUserResult = {
        id: mockUserResultId,
        tribe_id: mockTribeId,
      };

      const mockUserResultQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockUserResult,
          error: null,
        }),
      };

      const mockTribeSubcultureQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'No subculture found for this tribe' },
        }),
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce(mockUserResultQuery)
        .mockReturnValueOnce(mockTribeSubcultureQuery);

      await expect(
        subcultureService.fetchSubcultureByUserResultId(mockUserResultId)
      ).rejects.toThrow('Failed to fetch subculture for tribe');
    });

    it('should handle database errors gracefully', async () => {
      const mockUserResultId = 'user-result-123';

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection error' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      await expect(
        subcultureService.fetchSubcultureByUserResultId(mockUserResultId)
      ).rejects.toThrow('Failed to fetch user result: Database connection error');
    });
  });
});
