import { useState, useEffect, useCallback, useRef } from 'react';
import { cameraService } from '../services/cameraService';
import type { CameraState, CapturedPhoto } from '../types';

interface UseCameraReturn {
  state: CameraState;
  capturedPhoto: CapturedPhoto | null;
  requestCameraAccess: () => Promise<void>;
  stopCamera: () => void;
  capturePhoto: (videoElement: HTMLVideoElement) => Promise<void>;
  retakePhoto: () => void;
}

/**
 * Custom hook for managing camera access and photo capture
 * Handles camera permissions, state management, and cleanup
 */
export const useCamera = (): UseCameraReturn => {
  const [state, setState] = useState<CameraState>({ status: 'idle' });
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Request access to the device camera
   * Handles browser support, permissions, and errors
   */
  const requestCameraAccess = useCallback(async () => {
    // Check browser support first
    if (!cameraService.isCameraSupported()) {
      setState({ status: 'unsupported' });
      return;
    }

    setState({ status: 'requesting' });

    try {
      const stream = await cameraService.requestCameraAccess();
      streamRef.current = stream;
      setState({ status: 'active', stream });
    } catch (error) {
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setState({ status: 'denied' });
      } else if (error instanceof Error) {
        setState({ status: 'error', error });
      } else {
        setState({ status: 'error', error: new Error('Unknown camera error') });
      }
    }
  }, []);

  /**
   * Stop the camera stream and reset state
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      cameraService.stopCameraStream(streamRef.current);
      streamRef.current = null;
      setState({ status: 'idle' });
      setCapturedPhoto(null);
    }
  }, []);

  /**
   * Capture a photo from the video stream
   * Uses canvas to extract frame from video element
   */
  const capturePhoto = useCallback(
    async (videoElement: HTMLVideoElement): Promise<void> => {
      if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
        throw new Error('Invalid video element');
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(
        videoElement,
        0,
        0,
        videoElement.videoWidth,
        videoElement.videoHeight
      );

      const dataUrl = canvas.toDataURL('image/png');
      const timestamp = Date.now();

      setCapturedPhoto({ dataUrl, timestamp });
    },
    []
  );

  /**
   * Clear the captured photo and return to camera preview
   */
  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  /**
   * Cleanup: Stop camera stream when component unmounts
   */
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        cameraService.stopCameraStream(streamRef.current);
      }
    };
  }, []);

  return {
    state,
    capturedPhoto,
    requestCameraAccess,
    stopCamera,
    capturePhoto,
    retakePhoto,
  };
};
