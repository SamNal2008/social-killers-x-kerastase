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
        it('should fetch all moodboards with subculture data successfully', async () => {
            // Raw data from Supabase with joined subcultures
            const mockRawMoodboards = [
                {
                    id: '1',
                    image_url: 'https://example.com/img1.jpg',
                    subculture_id: 'sub-1',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    subcultures: { name: 'LEGACISTS', description: 'Heritage & Timeless Quality' }
                },
                {
                    id: '2',
                    image_url: 'https://example.com/img2.jpg',
                    subculture_id: 'sub-2',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    subcultures: { name: 'FUNCTIONALS', description: 'Practicality & Efficiency' }
                },
            ];

            // Expected transformed result
            const expectedMoodboards = [
                {
                    id: '1',
                    image_url: 'https://example.com/img1.jpg',
                    subculture_id: 'sub-1',
                    name: 'LEGACISTS',
                    description: 'Heritage & Timeless Quality',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                },
                {
                    id: '2',
                    image_url: 'https://example.com/img2.jpg',
                    subculture_id: 'sub-2',
                    name: 'FUNCTIONALS',
                    description: 'Practicality & Efficiency',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                },
            ];

            // @ts-expect-error - Mocking supabase for testing
            const mockSelect = jest.fn().mockResolvedValue({ data: mockRawMoodboards, error: null });
            // @ts-expect-error - Mocking supabase for testing
            mockSupabase.from = jest.fn().mockReturnValue({ select: mockSelect });

            const result = await moodboardService.getAll();

            expect(mockSupabase.from).toHaveBeenCalledWith('moodboards');
            expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('subcultures'));
            expect(result).toEqual(expectedMoodboards);
        });

        it('should handle moodboards without linked subcultures', async () => {
            const mockRawMoodboards = [
                {
                    id: '1',
                    image_url: 'https://example.com/img1.jpg',
                    subculture_id: null,
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                    subcultures: null
                },
            ];

            // @ts-expect-error - Mocking supabase for testing
            const mockSelect = jest.fn().mockResolvedValue({ data: mockRawMoodboards, error: null });
            // @ts-expect-error - Mocking supabase for testing
            mockSupabase.from = jest.fn().mockReturnValue({ select: mockSelect });

            const result = await moodboardService.getAll();

            expect(result[0].name).toBe('Unknown');
            expect(result[0].description).toBe('');
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
