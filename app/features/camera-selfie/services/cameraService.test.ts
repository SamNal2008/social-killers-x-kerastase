import { cameraService } from './cameraService';

describe('cameraService', () => {
  describe('isCameraSupported', () => {
    it('should return true when navigator.mediaDevices.getUserMedia exists', () => {
      const mockGetUserMedia = jest.fn();
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true,
        configurable: true,
      });

      expect(cameraService.isCameraSupported()).toBe(true);
    });

    it('should return false when navigator.mediaDevices does not exist', () => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(cameraService.isCameraSupported()).toBe(false);
    });

    it('should return false when getUserMedia does not exist', () => {
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {},
        writable: true,
        configurable: true,
      });

      expect(cameraService.isCameraSupported()).toBe(false);
    });
  });

  describe('requestCameraAccess', () => {
    let mockGetUserMedia: jest.Mock;
    let mockStream: MediaStream;

    beforeEach(() => {
      mockStream = {
        getTracks: jest.fn().mockReturnValue([]),
        getVideoTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      mockGetUserMedia = jest.fn().mockResolvedValue(mockStream);

      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: { getUserMedia: mockGetUserMedia },
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should request camera access with default constraints', async () => {
      const stream = await cameraService.requestCameraAccess();

      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' },
      });
      expect(stream).toBe(mockStream);
    });

    it('should request camera access with custom constraints', async () => {
      const customConstraints = {
        video: {
          facingMode: 'environment' as const,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      const stream = await cameraService.requestCameraAccess(customConstraints);

      expect(mockGetUserMedia).toHaveBeenCalledWith(customConstraints);
      expect(stream).toBe(mockStream);
    });

    it('should throw error when permission is denied', async () => {
      const deniedError = new Error('Permission denied');
      deniedError.name = 'NotAllowedError';
      mockGetUserMedia.mockRejectedValue(deniedError);

      await expect(cameraService.requestCameraAccess()).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should throw error when no camera device is found', async () => {
      const notFoundError = new Error('No camera found');
      notFoundError.name = 'NotFoundError';
      mockGetUserMedia.mockRejectedValue(notFoundError);

      await expect(cameraService.requestCameraAccess()).rejects.toThrow(
        'No camera found'
      );
    });

    it('should throw error when camera is in use', async () => {
      const inUseError = new Error('Camera in use');
      inUseError.name = 'NotReadableError';
      mockGetUserMedia.mockRejectedValue(inUseError);

      await expect(cameraService.requestCameraAccess()).rejects.toThrow(
        'Camera in use'
      );
    });
  });

  describe('stopCameraStream', () => {
    it('should stop all tracks in the stream', () => {
      const mockTrack1 = { stop: jest.fn() };
      const mockTrack2 = { stop: jest.fn() };
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([mockTrack1, mockTrack2]),
      } as unknown as MediaStream;

      cameraService.stopCameraStream(mockStream);

      expect(mockStream.getTracks).toHaveBeenCalled();
      expect(mockTrack1.stop).toHaveBeenCalled();
      expect(mockTrack2.stop).toHaveBeenCalled();
    });

    it('should handle streams with no tracks', () => {
      const mockStream = {
        getTracks: jest.fn().mockReturnValue([]),
      } as unknown as MediaStream;

      expect(() => cameraService.stopCameraStream(mockStream)).not.toThrow();
      expect(mockStream.getTracks).toHaveBeenCalled();
    });
  });
});
