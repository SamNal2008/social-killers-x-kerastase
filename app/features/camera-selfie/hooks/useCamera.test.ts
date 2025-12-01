import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from './useCamera';
import { cameraService } from '../services/cameraService';

jest.mock('../services/cameraService');

describe('useCamera', () => {
  const mockStream = {
    getTracks: jest.fn().mockReturnValue([]),
    getVideoTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
  } as unknown as MediaStream;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should start with idle state', () => {
      const { result } = renderHook(() => useCamera());

      expect(result.current.state).toEqual({ status: 'idle' });
      expect(result.current.capturedPhoto).toBeNull();
    });
  });

  describe('requestCameraAccess', () => {
    it('should change state to requesting when requesting access', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.requestCameraAccess();
      });

      expect(result.current.state.status).toBe('requesting');
    });

    it('should change state to active when permission granted', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state).toEqual({
        status: 'active',
        stream: mockStream,
      });
    });

    it('should change state to denied when permission denied', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      const deniedError = new Error('Permission denied');
      deniedError.name = 'NotAllowedError';
      jest.mocked(cameraService.requestCameraAccess).mockRejectedValue(deniedError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state.status).toBe('denied');
    });

    it('should change state to unsupported when browser does not support camera', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(false);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state.status).toBe('unsupported');
    });

    it('should change state to error when camera access fails', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      const genericError = new Error('Camera in use');
      jest.mocked(cameraService.requestCameraAccess).mockRejectedValue(genericError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state).toEqual({
        status: 'error',
        error: genericError,
      });
    });
  });

  describe('stopCamera', () => {
    it('should stop stream and set state to idle', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      // First, request camera access
      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state.status).toBe('active');

      // Then stop the camera
      act(() => {
        result.current.stopCamera();
      });

      expect(cameraService.stopCameraStream).toHaveBeenCalledWith(mockStream);
      expect(result.current.state).toEqual({ status: 'idle' });
      expect(result.current.capturedPhoto).toBeNull();
    });

    it('should do nothing if camera is not active', () => {
      const { result } = renderHook(() => useCamera());

      act(() => {
        result.current.stopCamera();
      });

      expect(cameraService.stopCameraStream).not.toHaveBeenCalled();
      expect(result.current.state).toEqual({ status: 'idle' });
    });
  });

  describe('capturePhoto', () => {
    it('should capture photo from video element', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480,
      } as HTMLVideoElement;

      const mockContext = {
        drawImage: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue(mockContext),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockdata'),
      } as unknown as HTMLCanvasElement;

      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas;
        return originalCreateElement(tagName);
      });

      const { result } = renderHook(() => useCamera());

      // First, request camera access
      await act(async () => {
        await result.current.requestCameraAccess();
      });

      // Then capture photo
      await act(async () => {
        await result.current.capturePhoto(mockVideo);
      });

      expect(mockCanvas.width).toBe(640);
      expect(mockCanvas.height).toBe(480);
      expect(mockContext.translate).toHaveBeenCalledWith(640, 0);
      expect(mockContext.scale).toHaveBeenCalledWith(-1, 1);
      expect(mockContext.drawImage).toHaveBeenCalledWith(mockVideo, 0, 0, 640, 480);
      expect(result.current.capturedPhoto).toEqual({
        dataUrl: 'data:image/png;base64,mockdata',
        timestamp: expect.any(Number),
      });

      jest.restoreAllMocks();
    });

    it('should throw error if video element is invalid', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      // First, request camera access
      await act(async () => {
        await result.current.requestCameraAccess();
      });

      // Try to capture without video element
      await expect(async () => {
        await act(async () => {
          await result.current.capturePhoto(null as unknown as HTMLVideoElement);
        });
      }).rejects.toThrow('Invalid video element');
    });
  });

  describe('retakePhoto', () => {
    it('should clear captured photo', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const mockVideo = {
        videoWidth: 640,
        videoHeight: 480,
      } as HTMLVideoElement;

      const mockContext = {
        drawImage: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
      } as unknown as CanvasRenderingContext2D;

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue(mockContext),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockdata'),
      } as unknown as HTMLCanvasElement;

      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas;
        return originalCreateElement(tagName);
      });

      const { result } = renderHook(() => useCamera());

      // Request camera and capture photo
      await act(async () => {
        await result.current.requestCameraAccess();
        await result.current.capturePhoto(mockVideo);
      });

      expect(result.current.capturedPhoto).not.toBeNull();

      // Retake photo
      act(() => {
        result.current.retakePhoto();
      });

      expect(result.current.capturedPhoto).toBeNull();

      jest.restoreAllMocks();
    });
  });

  describe('cleanup on unmount', () => {
    it('should stop camera stream when component unmounts', async () => {
      jest.mocked(cameraService.isCameraSupported).mockReturnValue(true);
      jest.mocked(cameraService.requestCameraAccess).mockResolvedValue(mockStream);

      const { result, unmount } = renderHook(() => useCamera());

      // Request camera access
      await act(async () => {
        await result.current.requestCameraAccess();
      });

      expect(result.current.state.status).toBe('active');

      // Unmount the hook
      unmount();

      expect(cameraService.stopCameraStream).toHaveBeenCalledWith(mockStream);
    });

    it('should not throw error when unmounting with no active stream', () => {
      const { unmount } = renderHook(() => useCamera());

      expect(() => unmount()).not.toThrow();
    });
  });
});
