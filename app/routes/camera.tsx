import type { Route } from './+types/camera';
import { CameraScreen } from '~/features/camera-selfie/components/CameraScreen';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Camera | Kérastase Experience' },
    { name: 'description', content: 'Take your selfie for AI moodboard generation' },
  ];
}

export default function Camera() {
  return <CameraScreen />;
}
