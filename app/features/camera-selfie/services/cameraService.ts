import type { ICameraService, CameraConstraints } from '../types';

/**
 * Default camera constraints - front-facing camera for selfies
 */
const DEFAULT_CONSTRAINTS: CameraConstraints = {
  video: {
    facingMode: 'user',
  },
};

/**
 * Camera service for managing device camera access
 * Handles browser compatibility, permissions, and media stream management
 */
class CameraService implements ICameraService {
  /**
   * Check if the browser supports camera access
   */
  isCameraSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  /**
   * Request access to the device camera
   * @throws Error if permission denied, camera not found, or camera in use
   */
  async requestCameraAccess(
    constraints: CameraConstraints = DEFAULT_CONSTRAINTS
  ): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to access camera');
    }
  }

  /**
   * Stop all tracks in a media stream
   * Releases camera resources
   */
  stopCameraStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

export const cameraService = new CameraService();
