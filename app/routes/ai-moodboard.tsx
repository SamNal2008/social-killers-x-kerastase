import type { Route } from './+types/ai-moodboard';
import { AiMoodboardScreen } from '~/features/ai-moodboard/components';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'AI Moodboard | Kérastase Experience' },
    { name: 'description', content: 'Your personalized AI-generated moodboard' },
  ];
}

export default function AiMoodboard() {
  return <AiMoodboardScreen />;
}
