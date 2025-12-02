# Implementation Plan: Fix Image Generation Flow

**Branch**: `fix-image-generation`
**Date**: 2025-12-03
**Status**: Planning

---

## Feature Requirements

### 1. Remove Retake Flow After Selfie
- **Current**: User takes selfie → sees retake option → manually clicks "Continue"
- **New**: User takes selfie → immediately trigger image generation (no retake screen)

### 2. Update Download Button to Use Web Share API
- **Current**: Downloads file via blob + temporary link element
- **New**: Use Web Share API to share image (especially for mobile)
- **Fallback**: Use current download method if Share API not available

### 3. Update Polaroid Date Format
- **Current**: Shows "1/3" in bottom left
- **New**: Show current date in format `DD.MM.YY` in bottom right
- **Keep**: "Tribes & Communities Day" text in bottom left

### 4. Display Subculture in Header
- **Where**: Generated image screen only
- **Content**: Tribe name (e.g., "LEGACIST") in gold/orange color
- **Position**: Above the main title

### 5. Fix Polaroid Aspect Ratio to 3:4
- **Component**: Add responsive min/max width constraints
- **API**: Update Gemini API call to generate 3:4 aspect ratio images
- **Config**: Use `aspectRatio: '3:4'` in `generationConfig.imageConfig`

---

## Files to Modify

### Frontend Changes

1. **`app/features/camera-selfie/components/CameraScreen.tsx`**
   - Remove `CameraResultSelfie` review screen
   - Auto-trigger `handleContinue()` after photo capture
   - Skip retake flow entirely

2. **`app/features/ai-moodboard/components/AiMoodboardScreen.tsx`**
   - Add tribe name display in header
   - Pass tribe data to header component

3. **`app/features/ai-moodboard/hooks/useAiMoodboard.ts`**
   - Replace `downloadImage()` with `shareImage()` using Web Share API
   - Implement fallback to download if Share API unavailable
   - Convert image URL to blob for sharing

4. **`app/shared/components/Polaroid/Polaroid.tsx`**
   - Remove `currentItem/totalItems` display
   - Add date display in `DD.MM.YY` format in bottom right
   - Add responsive min/max width constraints (aspect ratio 3:4)
   - Update interface to remove `currentItem` and `totalItems` props

### Backend Changes

5. **`supabase/functions/generate-image/index.ts`**
   - Add `imageConfig` to `generationConfig` with `aspectRatio: '3:4'`
   - Update line 184-186 in `callGeminiAPI()` function

---

## Implementation Details

### 1. Auto-trigger Image Generation (CameraScreen.tsx)

**Current Flow**:
```typescript
// Capture photo → set capturedPhoto state → show CameraResultSelfie
// User clicks "Continue" → handleContinue() → navigate to /ai-moodboard
```

**New Flow**:
```typescript
// Capture photo → handleContinue() immediately → navigate to /ai-moodboard
```

**Changes**:
- In `handleCapture()`: After setting `capturedPhoto`, immediately call `handleContinue()`
- Remove conditional rendering of `CameraResultSelfie`
- Keep `capturedPhoto` state for navigation

### 2. Web Share API Implementation (useAiMoodboard.ts)

**New Function**:
```typescript
const shareImage = async (imageUrl: string, filename: string) => {
  try {
    // Check if Web Share API is available
    if (!navigator.share || !navigator.canShare) {
      // Fallback to download
      return downloadImage(imageUrl, filename);
    }

    // Fetch image as blob
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    // Create File object from blob
    const file = new File([blob], filename, { type: blob.type });

    // Check if files can be shared
    if (!navigator.canShare({ files: [file] })) {
      // Fallback to download
      return downloadImage(imageUrl, filename);
    }

    // Share the image
    await navigator.share({
      files: [file],
      title: 'My Moodboard',
      text: 'Check out my signature moodboard!',
    });

    console.log('Image shared successfully');
  } catch (error) {
    // If user cancels or error occurs, fallback to download
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Error sharing image:', error);
      return downloadImage(imageUrl, filename);
    }
  }
};
```

**Error Handling**:
- Check `navigator.share` and `navigator.canShare` availability
- Fallback to current `downloadImage()` if unavailable
- Handle `AbortError` (user cancels share dialog)

### 3. Polaroid Date Update (Polaroid.tsx)

**Interface Changes**:
```typescript
export interface PolaroidProps {
  imageSrc?: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  // REMOVE: currentItem?: number;
  // REMOVE: totalItems?: number;
  className?: string;
}
```

**Date Formatting**:
```typescript
const formatDate = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits
  return `${day}.${month}.${year}`;
};
```

**Layout Changes**:
```html
<div className="flex justify-between items-center text-sm">
  <span>{subtitle || "Swipe to decide"}</span>
  <span>{formatDate()}</span>
</div>
```

**Responsive Width Constraints**:
```typescript
// Add to container div
className="
  w-full
  max-w-[343px]  // Mobile max width
  md:max-w-[400px]  // Tablet max width
  lg:max-w-[450px]  // Desktop max width
  mx-auto
  aspect-[3/4]  // Maintain 3:4 aspect ratio
"
```

### 4. Header Subculture Display (AiMoodboardScreen.tsx)

**Current Header**:
```tsx
<header className="mb-6">
  <h1 className="text-2xl font-serif text-center mb-2">
    {userName}'s signature moodboard
  </h1>
  <p className="text-sm text-center text-gray-600">
    A curated visual expression of your subculture.
  </p>
</header>
```

**New Header** (based on Figma):
```tsx
<header className="mb-6 text-center">
  {/* Tribe name in gold */}
  <div className="text-sm uppercase tracking-wider text-[#C9A962] mb-3">
    {state.tribe?.name || 'LEGACIST'}
  </div>

  {/* Main title */}
  <h1 className="text-2xl md:text-3xl font-serif mb-2">
    {userName}'s signature moodboard
  </h1>

  {/* Subtitle */}
  <p className="text-sm text-gray-600">
    A curated visual expression of your subculture.
  </p>
</header>
```

**Data Source**:
- Tribe name already available in `useAiMoodboard` state
- Access via `state.tribe.name` or similar

### 5. Gemini API Aspect Ratio (generate-image/index.ts)

**Current Config** (line 184-186):
```typescript
generationConfig: {
  responseModalities: ['Text', 'Image'],
},
```

**New Config**:
```typescript
generationConfig: {
  responseModalities: ['Text', 'Image'],
  imageConfig: {
    aspectRatio: '3:4',
  },
},
```

---

## Edge Cases & Error Handling

### Web Share API
- **Not supported**: Fallback to download
- **User cancels**: Catch `AbortError`, don't show error
- **Network error**: Show error message, allow retry

### Date Formatting
- **Timezone**: Use user's local timezone
- **Consistency**: Always format as `DD.MM.YY` (e.g., `03.12.25`)

### Polaroid Aspect Ratio
- **Image loading**: Show loading state while image loads
- **Broken images**: Show placeholder with error message
- **Responsive**: Maintain aspect ratio across all screen sizes

### Auto-trigger Image Generation
- **Fast capture**: Ensure state updates complete before navigation
- **Error handling**: Show error if navigation fails
- **Loading state**: Show loading immediately after capture

---

## Testing Checklist

### Unit Tests
- [ ] `formatDate()` returns correct `DD.MM.YY` format
- [ ] `shareImage()` checks for Web Share API availability
- [ ] `shareImage()` falls back to `downloadImage()` when needed
- [ ] Polaroid component renders without `currentItem`/`totalItems`

### Component Tests
- [ ] Polaroid displays date in bottom right
- [ ] Polaroid maintains 3:4 aspect ratio
- [ ] Header displays tribe name correctly
- [ ] Download button triggers share (with mock Web Share API)

### Integration Tests
- [ ] Camera capture auto-navigates to AI moodboard
- [ ] Generated images have 3:4 aspect ratio
- [ ] Share dialog appears on mobile (manual test)
- [ ] Download fallback works when share unavailable

### Manual Browser Tests
- [ ] Mobile (375px): Share API works
- [ ] Mobile (428px): Polaroid aspect ratio maintained
- [ ] Tablet (768px): Layout responsive
- [ ] Desktop (1280px): All features work
- [ ] Safari: Web Share API supported
- [ ] Chrome: Web Share API supported
- [ ] Firefox: Fallback to download works

---

## Deployment Notes

### Supabase Edge Function
- Deploy updated `generate-image` function
- Test aspect ratio in staging environment
- Monitor for any API errors

### Environment Variables
- No new environment variables needed
- Existing `GEMINI_API_KEY` and `GEMINI_API_ENDPOINT` remain unchanged

---

## Rollback Plan

If issues occur:
1. Revert frontend changes via git
2. Redeploy previous Edge Function version
3. Clear any cached images in Supabase Storage if needed

---

## Success Criteria

- ✅ Selfie capture immediately triggers image generation
- ✅ Web Share API works on mobile devices
- ✅ Download fallback works on desktop
- ✅ Polaroid shows date as `DD.MM.YY` in bottom right
- ✅ Tribe name displays in header on generated image screen
- ✅ All generated images have 3:4 aspect ratio
- ✅ No console errors or warnings
- ✅ All tests pass
- ✅ Production build succeeds

---

## Next Steps

1. Create pre-development checklist
2. Write failing tests (TDD - RED phase)
3. Implement changes (TDD - GREEN phase)
4. Refactor for code quality (TDD - REFACTOR phase)
5. Manual browser testing
6. Deploy to staging
7. Create pull request
