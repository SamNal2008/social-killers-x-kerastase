import { resultsService } from './resultsService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('resultsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchUserResult', () => {
        it('should fetch user result with tribe percentages successfully', async () => {
            const mockUserResult = {
                id: 'result-123',
                user_id: 'user-456',
                tribe_id: 'tribe-789',
                created_at: '2025-12-01T00:00:00Z',
                tribe: {
                    id: 'tribe-789',
                    name: 'Minimalist',
                },
                user: {
                    id: 'user-456',
                    name: 'John Doe',
                },
            };

            const mockTribePercentages = [
                {
                    tribe_id: 'tribe-789',
                    percentage: 45.5,
                    tribe: {
                        id: 'tribe-789',
                        name: 'Minimalist',
                    },
                },
                {
                    tribe_id: 'tribe-abc',
                    percentage: 30.2,
                    tribe: {
                        id: 'tribe-abc',
                        name: 'Maximalist',
                    },
                },
            ];

            const mockUserResultQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: mockUserResult,
                    error: null,
                }),
            };

            const mockTribesQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: mockTribePercentages,
                    error: null,
                }),
            };

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(mockUserResultQuery)
                .mockReturnValueOnce(mockTribesQuery);

            const result = await resultsService.fetchUserResult('result-123');

            expect(result).toEqual({
                userResult: {
                    id: 'result-123',
                    userId: 'user-456',
                    dominantTribeId: 'tribe-789',
                    dominantTribeName: 'Minimalist',
                    createdAt: '2025-12-01T00:00:00Z',
                },
                tribePercentages: [
                    {
                        tribeId: 'tribe-789',
                        tribeName: 'Minimalist',
                        percentage: 45.5,
                    },
                    {
                        tribeId: 'tribe-abc',
                        tribeName: 'Maximalist',
                        percentage: 30.2,
                    },
                ],
            });
        });

        it('should throw error when user result is not found', async () => {
            const mockQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Not found' },
                }),
            };

            (supabase.from as jest.Mock).mockReturnValue(mockQuery);

            await expect(resultsService.fetchUserResult('invalid-id')).rejects.toThrow(
                'Failed to fetch user result'
            );
        });

        it('should throw error when tribe percentages fetch fails', async () => {
            const mockUserResult = {
                id: 'result-123',
                user_id: 'user-456',
                tribe_id: 'tribe-789',
                created_at: '2025-12-01T00:00:00Z',
                tribe: {
                    id: 'tribe-789',
                    name: 'Minimalist',
                },
                user: {
                    id: 'user-456',
                    name: 'John Doe',
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

            const mockTribesQuery = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockResolvedValue({
                    data: null,
                    error: { message: 'Database error' },
                }),
            };

            (supabase.from as jest.Mock)
                .mockReturnValueOnce(mockUserResultQuery)
                .mockReturnValueOnce(mockTribesQuery);

            await expect(resultsService.fetchUserResult('result-123')).rejects.toThrow(
                'Failed to fetch tribe percentages'
            );
        });
    });
});
