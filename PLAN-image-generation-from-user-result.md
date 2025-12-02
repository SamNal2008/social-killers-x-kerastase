# Feature Plan: Image Generation from User Result

**Feature Branch**: `feature/image-generation-from-user-result`
**Status**: Planning
**Date**: 2025-12-02

## 📋 Feature Overview

Create an AI-powered moodboard screen that generates multiple personalized images based on the user's tribe, displaying them in a carousel of polaroid-style cards. Users can navigate through generated images and download their favorites.

## 🎯 Requirements

- [x] Explore codebase and understand current architecture
- [ ] Develop AI Moodboard screen matching Figma design
- [ ] Trigger image generation after camera capture
- [ ] Connect to Gemini API for image generation
- [ ] Build prompt based on user's tribe
- [ ] Generate multiple images in parallel
- [ ] Display images in polaroid carousel with navigation
- [ ] Allow image download

## 🏗️ Architecture & Design

### Component Structure (Screaming Architecture)

```
app/
├── features/
│   ├── ai-moodboard/
│   │   ├── components/
│   │   │   ├── AiMoodboardScreen.tsx
│   │   │   ├── AiMoodboardScreen.test.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAiMoodboard.ts
│   │   │   └── useAiMoodboard.test.ts
│   │   ├── services/
│   │   │   ├── geminiImageService.ts
│   │   │   ├── geminiImageService.test.ts
│   │   │   ├── promptService.ts
│   │   │   └── promptService.test.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── README.md
│   └── camera-selfie/
│       └── (modify existing files)
└── routes/
    └── ai-moodboard.tsx (new route)
```

### Data Flow

```
1. User completes questionnaire → userResultId stored in localStorage
2. User navigates to /camera
3. User captures photo → base64 dataUrl stored
4. handleContinue triggers → Navigate to /ai-moodboard with state
5. AiMoodboardScreen:
   - Fetches user result (tribe info)
   - Builds prompt based on tribe
   - Generates 3-5 images in parallel using Gemini
   - Displays in carousel with navigation
   - Allows download
```

## 📐 Figma Design Analysis

**Design Reference**: [Figma Node 4-459](https://www.figma.com/design/Tw819TjJmPG187n6eXbxZ9/Ora-for-Kerastase-🔮?node-id=4-459)

**Visual Structure**:
- Background: `#F9FAFB` (Surface Light)
- Header:
  - Back button (top left)
  - Tribe badge: "LEGACIST" (uppercase, gold `#C9A961`, 10px semi-bold, 2px letter spacing)
  - Title: "{Name}'s signature moodboard" (Crimson Pro 36px)
  - Subtitle: "A curated visual expression of your subculture." (Inter 16px, gray)
- Content:
  - Polaroid card with generated image
  - Subtitle: "Tribes & Communities Day"
  - Date: "05.12.25"
  - Navigation: Left/Right circle buttons
  - Download button: Dark button with "Download this picture"

**Reusable Components**:
- `Polaroid` ✅ (exists in design system)
- `CircleButton` ✅ (exists in design system)
- `Button` ✅ (exists in design system)
- `Title`, `Body`, `Caption` ✅ (Typography components exist)

## 🔧 Technical Implementation Details

### 1. Types Definition

**File**: `app/features/ai-moodboard/types/index.ts`

```typescript
export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export type AiMoodboardState =
  | { status: 'idle' }
  | { status: 'loading-tribe' }
  | { status: 'generating'; progress: number }
  | { status: 'success'; images: GeneratedImage[] }
  | { status: 'error'; error: Error };

export interface TribePromptData {
  tribeId: string;
  tribeName: string;
  subcultureName: string;
  keywords: string[];
}
```

### 2. Prompt Service

**File**: `app/features/ai-moodboard/services/promptService.ts`

Build prompts based on tribe. Initially use hardcoded mapping, later connect to database.

```typescript
const TRIBE_PROMPTS: Record<string, string> = {
  'legacist': 'Classic, timeless, elegant heritage aesthetics...',
  'modernist': 'Contemporary, minimalist, sleek design...',
  // Add more tribes
};

export const buildImagePrompt = (tribeData: TribePromptData): string => {
  const basePrompt = TRIBE_PROMPTS[tribeData.tribeName.toLowerCase()];
  const keywordPrompt = tribeData.keywords.join(', ');
  return `${basePrompt}. Style: ${keywordPrompt}`;
};
```

### 3. Gemini Image Service

**File**: `app/features/ai-moodboard/services/geminiImageService.ts`

Replace existing Edge Function call with Gemini API.

```typescript
export interface GeminiGenerateImageRequest {
  prompt: string;
  userResultId: string;
  numberOfImages: number;
}

export const geminiImageService = {
  async generateImages(request: GeminiGenerateImageRequest): Promise<GeneratedImage[]> {
    // Call Supabase Edge Function that interfaces with Gemini
    // Generate multiple images in parallel (3-5 images)
    // Return array of generated images
  }
};
```

**Note**: Edge Function will handle Gemini API key and actual API calls for security.

### 4. AI Moodboard Hook

**File**: `app/features/ai-moodboard/hooks/useAiMoodboard.ts`

```typescript
export const useAiMoodboard = (userResultId: string) => {
  const [state, setState] = useState<AiMoodboardState>({ status: 'idle' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const generateImages = async () => {
    // 1. Fetch user result to get tribe
    // 2. Build prompt using promptService
    // 3. Generate 3-5 images in parallel
    // 4. Update state with images
  };

  const nextImage = () => setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1));
  const previousImage = () => setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  const downloadImage = async (imageUrl: string) => { /* implementation */ };

  return { state, currentImageIndex, generateImages, nextImage, previousImage, downloadImage };
};
```

### 5. AI Moodboard Screen Component

**File**: `app/features/ai-moodboard/components/AiMoodboardScreen.tsx`

Mobile-first responsive design following CLAUDE.md standards.

```typescript
export const AiMoodboardScreen: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userPhoto, userResultId } = location.state || {};

  const { state, currentImageIndex, nextImage, previousImage, downloadImage } = useAiMoodboard(userResultId);

  // Loading state
  if (state.status === 'generating') {
    return <LoadingScreen progress={state.progress} />;
  }

  // Success state
  if (state.status === 'success') {
    const currentImage = state.images[currentImageIndex];

    return (
      <div className="bg-surface-light min-h-screen p-6 md:p-8">
        {/* Back button */}
        {/* Tribe badge */}
        {/* Title with user name */}
        {/* Subtitle */}

        {/* Polaroid with navigation */}
        <Polaroid
          imageSrc={currentImage.url}
          imageAlt="Generated moodboard"
          title=""
          subtitle="Tribes & Communities Day"
          currentItem={currentImageIndex + 1}
          totalItems={state.images.length}
        />

        {/* Circle buttons for navigation */}
        <div className="flex gap-6 justify-center">
          <CircleButton
            variant="left"
            ariaLabel="Previous image"
            onClick={previousImage}
            disabled={currentImageIndex === 0}
          />
          <CircleButton
            variant="right"
            ariaLabel="Next image"
            onClick={nextImage}
            disabled={currentImageIndex === state.images.length - 1}
          />
        </div>

        {/* Download button */}
        <Button onClick={() => downloadImage(currentImage.url)}>
          Download this picture
        </Button>
      </div>
    );
  }

  return null;
};
```

### 6. Update Camera Flow

**File**: `app/features/camera-selfie/components/CameraScreen.tsx` (Line 49-73)

Modify `handleContinue` to navigate to AI moodboard:

```typescript
const handleContinue = async () => {
  if (!capturedPhoto) return;

  const userResultId = localStorageUtils.getUserResultId();
  if (!userResultId) {
    console.error('No user result ID found');
    alert('Error: User result not found. Please complete the questionnaire first.');
    return;
  }

  // Navigate to AI moodboard screen
  navigate('/ai-moodboard', {
    state: {
      userPhoto: capturedPhoto.dataUrl,
      userResultId,
    },
  });
};
```

### 7. Add Route

**File**: `app/routes.ts`

```typescript
import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.tsx"),
  route("/camera", "routes/camera.tsx"),
  route("/ai-moodboard", "routes/ai-moodboard.tsx"), // NEW
  route("/details/:id", "routes/details.tsx"),
] satisfies RouteConfig;
```

**File**: `app/routes/ai-moodboard.tsx` (NEW)

```typescript
import type { Route } from './+types/ai-moodboard';
import { AiMoodboardScreen } from '~/features/ai-moodboard/components/AiMoodboardScreen';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'AI Moodboard | Kérastase Experience' },
    { name: 'description', content: 'Your personalized AI-generated moodboard' },
  ];
}

export default function AiMoodboard() {
  return <AiMoodboardScreen />;
}
```

## 🧪 Testing Strategy (TDD)

### Test Order (Red → Green → Refactor)

1. **Unit Tests**:
   - `promptService.test.ts`: Test prompt building logic
   - `geminiImageService.test.ts`: Test image generation API calls (mocked)

2. **Hook Tests**:
   - `useAiMoodboard.test.ts`: Test state management, navigation, download

3. **Component Tests**:
   - `AiMoodboardScreen.test.tsx`: Test rendering, user interactions

4. **Integration Tests**:
   - End-to-end flow from camera → AI moodboard

### Key Test Scenarios

**Prompt Service**:
- ✅ Builds correct prompt for each tribe
- ✅ Handles unknown tribe gracefully
- ✅ Incorporates keywords into prompt

**Gemini Image Service**:
- ✅ Successfully generates multiple images
- ✅ Handles API errors
- ✅ Handles rate limiting
- ✅ Returns array of image URLs

**AI Moodboard Component**:
- ✅ Shows loading state during generation
- ✅ Displays generated images in polaroid
- ✅ Navigation buttons work correctly
- ✅ Download button triggers download
- ✅ Handles no user result error
- ✅ Mobile-responsive layout

## 🔒 Security Considerations

- ✅ Gemini API key stored in environment variables
- ✅ API calls made server-side via Edge Function
- ✅ Rate limiting on image generation
- ✅ Validate user result ID exists
- ✅ Sanitize prompts before sending to Gemini

## 🎨 Design System Compliance

**Typography**:
- Caption 1: Tribe badge (Inter Semi Bold 10px, letter-spacing 2px)
- Title H1: Main title (Crimson Pro 36px)
- Body 1: Subtitle (Inter 16px)
- Body 2: Polaroid subtitle (Inter 14px)
- Caption 2: Date (Inter Medium 12px)

**Colors**:
- Primary: `#C9A961` (gold)
- Neutral Dark: `#101828`
- Neutral Gray: `#6A7282`
- Neutral Gray 200: `#D9DBE1`
- Surface Light: `#F9FAFB`
- Neutral White: `#FFFFFF`

**Spacing**: 6px increments (gap-1.5, gap-4, gap-6, gap-10, gap-12)

**Mobile-First Breakpoints**:
- Base: 375px (mobile)
- md: 768px (tablet)
- lg: 1024px (desktop)

## 📦 Dependencies

**New Dependencies** (if any):
- None (use existing Supabase, Framer Motion, React Router)

## 🚀 Implementation Checklist

### Phase 1: Setup & Types
- [ ] Create feature directory structure
- [ ] Define TypeScript types
- [ ] Write type tests

### Phase 2: Services (TDD)
- [ ] Write failing tests for promptService
- [ ] Implement promptService
- [ ] Write failing tests for geminiImageService
- [ ] Implement geminiImageService (Edge Function)
- [ ] Refactor services

### Phase 3: Hook (TDD)
- [ ] Write failing tests for useAiMoodboard
- [ ] Implement useAiMoodboard
- [ ] Refactor hook

### Phase 4: Component (TDD)
- [ ] Write failing tests for AiMoodboardScreen
- [ ] Implement AiMoodboardScreen
- [ ] Refactor component for mobile-first design

### Phase 5: Integration
- [ ] Update CameraScreen to navigate to AI moodboard
- [ ] Add route configuration
- [ ] Test end-to-end flow

### Phase 6: Manual Testing
- [ ] Mobile viewport (375px, 428px)
- [ ] Tablet viewport (768px, 1024px)
- [ ] Desktop viewport (1280px, 1920px)
- [ ] Keyboard navigation
- [ ] Error states
- [ ] Loading states

### Phase 7: Performance & Polish
- [ ] Optimize image loading
- [ ] Add loading indicators
- [ ] Optimize bundle size
- [ ] Run Lighthouse audit

## 🔄 Edge Cases & Error Handling

1. **No user result found**:
   - Show error message
   - Redirect to questionnaire

2. **Image generation fails**:
   - Show retry button
   - Log error for monitoring

3. **No images generated**:
   - Show fallback message
   - Offer to retake photo

4. **Slow generation**:
   - Show progress indicator
   - Allow cancellation

5. **Download fails**:
   - Show error toast
   - Offer retry

## 📝 Notes & Decisions

- **Why Gemini?**: User requested Gemini API for image generation
- **Number of images**: Generate 3 images in parallel (confirmed)
- **Gemini API**: Placeholder endpoint for now, will be updated later
- **Image storage**: Store generated images in Supabase Storage permanently
- **User name**: Fetch from localStorage (questionnaire) or database
- **Selfie usage**: Include user's selfie in Gemini prompt for personalization
- **Prompt strategy**: Fetch tribes from database, use placeholder prompts for each tribe
- **Loading UX**: Simple loading animation without progress bar
- **Performance**: Generate images in parallel to reduce wait time

## 🔗 Related Files

- [app/features/camera-selfie/components/CameraScreen.tsx](app/features/camera-selfie/components/CameraScreen.tsx:49-73) - Modify handleContinue
- [app/shared/components/Polaroid/Polaroid.tsx](app/shared/components/Polaroid/Polaroid.tsx) - Reuse existing component
- [app/shared/components/CircleButton/CircleButton.tsx](app/shared/components/CircleButton/CircleButton.tsx) - Reuse for navigation
- [supabase/functions/compute-user-result/types.ts](supabase/functions/compute-user-result/types.ts) - Reference for tribe structure

## 🎯 Success Criteria

- [ ] All tests pass (unit, component, integration)
- [ ] Type checking passes
- [ ] Production build succeeds
- [ ] Mobile-first design verified
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] Performance metrics acceptable (Lighthouse 90+)
- [ ] Matches Figma design pixel-perfect

---

**Last Updated**: 2025-12-02
**Next Steps**: Begin Phase 1 - Setup & Types
