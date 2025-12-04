import { moodboardUploadService } from './moodboardUploadService';
import { supabase } from '~/shared/services/supabase';

jest.mock('~/shared/services/supabase', () => ({
  supabase: {
    from: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

describe('moodboardUploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSubculturesWithMoodboards', () => {
    it('should fetch all subcultures with their moodboard data', async () => {
      const mockData = [
        {
          id: 'sub-1',
          name: 'LEGACISTS',
          moodboards: [{ id: 'mood-1', image_url: 'https://example.com/img1.jpg' }],
        },
        {
          id: 'sub-2',
          name: 'FUNCTIONALS',
          moodboards: [{ id: 'mood-2', image_url: 'https://example.com/img2.jpg' }],
        },
        {
          id: 'sub-3',
          name: 'ROMANTICS',
          moodboards: [{ id: 'mood-3', image_url: null }],
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await moodboardUploadService.fetchSubculturesWithMoodboards();

      expect(supabase.from).toHaveBeenCalledWith('subcultures');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('moodboards'));
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        id: 'sub-1',
        name: 'LEGACISTS',
        moodboardId: 'mood-1',
        currentImageUrl: 'https://example.com/img1.jpg',
      });
      expect(result[2].currentImageUrl).toBeNull();
    });

    it('should handle subcultures without moodboards', async () => {
      const mockData = [
        {
          id: 'sub-1',
          name: 'LEGACISTS',
          moodboards: [],
        },
      ];

      const mockSelect = jest.fn().mockResolvedValue({ data: mockData, error: null });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await moodboardUploadService.fetchSubculturesWithMoodboards();

      expect(result).toHaveLength(1);
      expect(result[0].moodboardId).toBeNull();
      expect(result[0].currentImageUrl).toBeNull();
    });

    it('should throw error when fetch fails', async () => {
      const mockError = { message: 'Database connection failed' };
      const mockSelect = jest.fn().mockResolvedValue({ data: null, error: mockError });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(moodboardUploadService.fetchSubculturesWithMoodboards()).rejects.toThrow(
        'Failed to fetch subcultures: Database connection failed'
      );
    });
  });

  describe('uploadMoodboardImage', () => {
    it('should call edge function and return public URL on success', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const subcultureId = 'sub-1';
      const expectedImageUrl = 'https://storage.example.com/moodboard_pictures/sub-1/123_test.jpg';

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { imageUrl: expectedImageUrl },
        },
        error: null,
      });

      const result = await moodboardUploadService.uploadMoodboardImage(mockFile, subcultureId);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('upload-moodboard-image', {
        body: expect.objectContaining({
          subcultureId,
          fileName: 'test.jpg',
          fileType: 'image/jpeg',
          fileSize: mockFile.size,
        }),
      });
      expect(result).toEqual({
        success: true,
        imageUrl: expectedImageUrl,
      });
    });

    it('should return error when edge function invocation fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Edge function error' },
      });

      const result = await moodboardUploadService.uploadMoodboardImage(mockFile, 'sub-1');

      expect(result).toEqual({
        success: false,
        error: 'Edge function error',
      });
    });

    it('should return error when edge function returns error response', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          success: false,
          error: { code: 'UPLOAD_ERROR', message: 'Storage upload failed' },
        },
        error: null,
      });

      const result = await moodboardUploadService.uploadMoodboardImage(mockFile, 'sub-1');

      expect(result).toEqual({
        success: false,
        error: 'Storage upload failed',
      });
    });

    it('should validate file type before calling edge function', async () => {
      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });

      const result = await moodboardUploadService.uploadMoodboardImage(mockFile, 'sub-1');

      expect(result).toEqual({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      });
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });

    it('should validate file size before calling edge function', async () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
      const mockFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

      const result = await moodboardUploadService.uploadMoodboardImage(mockFile, 'sub-1');

      expect(result).toEqual({
        success: false,
        error: 'File size exceeds 10MB limit.',
      });
      expect(supabase.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('updateMoodboardImageUrl', () => {
    it('should update moodboard image URL in database', async () => {
      const moodboardId = 'mood-1';
      const imageUrl = 'https://storage.example.com/new-image.jpg';

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: { id: moodboardId }, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await moodboardUploadService.updateMoodboardImageUrl(moodboardId, imageUrl);

      expect(supabase.from).toHaveBeenCalledWith('moodboards');
      expect(mockUpdate).toHaveBeenCalledWith({ image_url: imageUrl });
      expect(mockEq).toHaveBeenCalledWith('id', moodboardId);
    });

    it('should throw error when update fails', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: null, error: { message: 'Update failed' } });

      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });
      mockUpdate.mockReturnValue({ eq: mockEq });

      await expect(
        moodboardUploadService.updateMoodboardImageUrl('mood-1', 'https://example.com/img.jpg')
      ).rejects.toThrow('Failed to update moodboard image URL: Update failed');
    });
  });

  describe('createMoodboardForSubculture', () => {
    it('should create a new moodboard for subculture and return its ID', async () => {
      const subcultureId = 'sub-1';
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'new-mood-1' },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await moodboardUploadService.createMoodboardForSubculture(subcultureId);

      expect(supabase.from).toHaveBeenCalledWith('moodboards');
      expect(mockInsert).toHaveBeenCalledWith({ subculture_id: subcultureId });
      expect(result).toBe('new-mood-1');
    });

    it('should throw error when creation fails', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
      });
      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await expect(moodboardUploadService.createMoodboardForSubculture('sub-1')).rejects.toThrow(
        'Failed to create moodboard: Insert failed'
      );
    });
  });
});
