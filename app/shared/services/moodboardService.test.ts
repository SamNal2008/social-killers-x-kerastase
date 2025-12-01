import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { moodboardService } from './moodboardService';
import { supabase } from './supabase';

jest.mock('./supabase');

describe('moodboardService', () => {
    const mockSupabase = supabase as jest.Mocked<typeof supabase>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all moodboards successfully', async () => {
            const mockMoodboards = [
                { id: '1', name: 'Moodboard 1', description: 'Desc 1' },
                { id: '2', name: 'Moodboard 2', description: 'Desc 2' },
            ];

            // @ts-expect-error - Mocking supabase for testing
            const mockSelect = jest.fn().mockResolvedValue({ data: mockMoodboards, error: null });
            // @ts-expect-error - Mocking supabase for testing
            mockSupabase.from = jest.fn().mockReturnValue({ select: mockSelect });

            const result = await moodboardService.getAll();

            expect(mockSupabase.from).toHaveBeenCalledWith('moodboards');
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(result).toEqual(mockMoodboards);
        });

        it('should throw an error when fetch fails', async () => {
            const mockError = { message: 'Network error' };
            // @ts-expect-error - Mocking supabase for testing
            const mockSelect = jest.fn().mockResolvedValue({ data: null, error: mockError });
            // @ts-expect-error - Mocking supabase for testing
            mockSupabase.from = jest.fn().mockReturnValue({ select: mockSelect });

            await expect(moodboardService.getAll()).rejects.toThrow('Failed to fetch moodboards: Network error');
        });
    });
});
