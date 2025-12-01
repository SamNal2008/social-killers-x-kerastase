/**
 * Camera permission states following MediaDevices API
 */
export type CameraPermissionState = 'granted' | 'denied' | 'prompt';

/**
 * Camera state using discriminated union pattern
 * Ensures type safety and prevents invalid state combinations
 */
export type CameraState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'active'; stream: MediaStream }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'error'; error: Error };

/**
 * Camera capabilities and constraints
 */
export interface CameraConstraints {
  video: {
    facingMode: 'user' | 'environment';
    width?: { ideal: number };
    height?: { ideal: number };
  };
}

/**
 * Captured photo data
 */
export interface CapturedPhoto {
  dataUrl: string;
  timestamp: number;
}

/**
 * Camera service interface
 */
export interface ICameraService {
  isCameraSupported: () => boolean;
  requestCameraAccess: (constraints?: CameraConstraints) => Promise<MediaStream>;
  stopCameraStream: (stream: MediaStream) => void;
}
