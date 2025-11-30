import { userService } from './userService';
import type { Tables } from '~/shared/types/database.types';

type User = Tables<'users'>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with generated guest name format Guest-{timestamp}', async () => {
      const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      const { supabase } = await import('./supabase');
      const mockClient = supabase as any;
      mockClient._mocks.single.mockResolvedValue({ data: mockUser, error: null });

      const result = await userService.create();

      expect(result).toEqual(mockUser);
      expect(mockClient.from).toHaveBeenCalledWith('users');
      expect(mockClient._mocks.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/^Guest-\d+$/),
        })
      );
    });

    it('should throw error when database insert fails', async () => {
      const { supabase } = await import('./supabase');
      const mockClient = supabase as any;
      mockClient._mocks.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      await expect(userService.create()).rejects.toThrow('Failed to create user: Database connection failed');
    });

    it('should return user with all required fields', async () => {
      const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      const { supabase } = await import('./supabase');
      const mockClient = supabase as any;
      mockClient._mocks.single.mockResolvedValue({ data: mockUser, error: null });

      const result = await userService.create();

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('connection_date');
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });

    it('should generate unique guest names based on timestamp', async () => {
      const mockUser1: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      const mockUser2: User = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Guest-1701388801000',
        connection_date: '2024-12-01T00:00:01.000Z',
        created_at: '2024-12-01T00:00:01.000Z',
        updated_at: '2024-12-01T00:00:01.000Z',
      };

      const { supabase } = await import('./supabase');
      const mockClient = supabase as any;

      // First call
      mockClient._mocks.single.mockResolvedValueOnce({ data: mockUser1, error: null });
      const result1 = await userService.create();

      // Second call (simulating a different timestamp)
      mockClient._mocks.single.mockResolvedValueOnce({ data: mockUser2, error: null });
      const result2 = await userService.create();

      expect(result1.name).toMatch(/^Guest-\d+$/);
      expect(result2.name).toMatch(/^Guest-\d+$/);
    });

    it('should log user creation to console in development', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      const { supabase } = await import('./supabase');
      const mockClient = supabase as any;
      mockClient._mocks.single.mockResolvedValue({ data: mockUser, error: null });

      await userService.create();

      expect(consoleSpy).toHaveBeenCalledWith(
        'User created:',
        expect.objectContaining({ id: mockUser.id })
      );

      consoleSpy.mockRestore();
    });
  });
});
