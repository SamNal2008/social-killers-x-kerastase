# Feature: Image Generation from Selfie

**Ticket**: after-picture-loading-screen
**Branch**: feature/after-picture-loading-screen
**Created**: 2024-12-01
**Status**: Backend Complete, Frontend Integrated, Testing Pending

## Overview

Implement image generation feature that:
1. Shows loading screen after photo capture (Figma design)
2. Sends photo to Supabase Edge Function
3. Edge Function calls Google Gemini API (Neobanana) to generate personalized image
4. Stores generated image in Supabase Storage
5. Returns generated image URL to frontend

## Requirements

### Frontend (React Component Architect)
- [ ] Create loading screen component matching Figma design (https://www.figma.com/design/Tw819TjJmPG187n6eXbxZ9/Ora-for-Kerastase-🔮?node-id=6-656&m=dev)
- [ ] Update `CameraResultSelfie` component to trigger image generation
- [ ] Create service to call Edge Function
- [ ] Handle loading, success, and error states
- [ ] Display generated image when ready

### Backend (Supabase Backend Engineer)
- [ ] Create `generate-image` Edge Function
- [ ] Set up Supabase Storage bucket for generated images
- [ ] Configure RLS policies for storage
- [ ] Implement Google Gemini API integration
- [ ] Create prompt generation method (hardcoded for now)
- [ ] Store generated image in Supabase Storage
- [ ] Update user_results table to include generated_image_url field

## Technical Architecture

### Database Changes
```sql
-- Add generated_image_url to user_results table
ALTER TABLE user_results 
ADD COLUMN generated_image_url TEXT;

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- RLS policies for storage
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');
```

### Edge Function Structure
```
supabase/functions/generate-image/
├── index.ts              # HTTP handler
├── handlers.ts           # Request/response handling
├── services.ts           # Business logic
├── prompts.ts            # Prompt generation
└── types.ts              # TypeScript types
```

### API Contract

**Request** (POST `/functions/v1/generate-image`):
```typescript
{
  userResultId: string;  // UUID
  userPhoto: string;     // Base64 encoded image
}
```

**Response**:
```typescript
{
  imageUrl: string;      // Supabase Storage URL
  userResultId: string;
}
```

## Implementation Steps

### Phase 1: Backend Setup (Supabase Backend Engineer) ✅ COMPLETE
1. ✅ Create database migration for storage bucket and user_results column
2. ✅ Apply migration locally
3. ✅ Test storage bucket creation
4. ✅ Generate updated TypeScript types

### Phase 2: Edge Function Development (Supabase Backend Engineer) ✅ COMPLETE
1. ✅ Create Edge Function structure with separation of concerns
   - `index.ts` - HTTP layer
   - `handlers.ts` - Request/response handling
   - `services.ts` - Business logic
   - `prompts.ts` - Prompt generation
   - `types.ts` - TypeScript types
2. ✅ Implement prompt generation (hardcoded: "Take this picture and make him happy to code now")
3. ✅ Integrate Google Gemini API (gemini-2.0-flash-exp model)
4. ✅ Implement image storage logic to Supabase Storage
5. ✅ Add validation and error handling with custom error classes
6. ⏳ Test locally with curl (PENDING - requires GOOGLE_GEMINI_API_KEY)

### Phase 3: Frontend Integration (React Component Architect) ✅ COMPLETE
1. ✅ Create loading screen component (`CameraLoadingScreen.tsx`)
   - Animated loading spinner
   - Progress dots
   - User-friendly messaging
2. ✅ Create image generation service (`imageGenerationService.ts`)
3. ✅ Create image generation hook (`useImageGeneration.ts`)
4. ✅ Update CameraResultSelfie component with Continue button
5. ✅ Update CameraScreen to integrate image generation flow
6. ✅ Add loading state display during generation

### Phase 4: Testing & Validation ⏳ IN PROGRESS
1. ⏳ Unit tests for Edge Function services
2. ⏳ Component tests for loading screen
3. ⏳ Integration tests for full flow
4. ⏳ Manual browser testing
5. ⏳ Performance validation

## Environment Variables

**Supabase Edge Function**:
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key (set in Supabase dashboard)

**Frontend** (already exists):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Dependencies

**Backend**:
- Google Gemini API SDK for Deno
- Supabase Storage client

**Frontend**:
- No new dependencies (use existing Supabase client)

## Testing Strategy

### Backend Tests
- [ ] Prompt generation returns expected format
- [ ] Google Gemini API integration works
- [ ] Image upload to storage succeeds
- [ ] Database update succeeds
- [ ] Error handling for API failures
- [ ] Error handling for storage failures

### Frontend Tests
- [ ] Loading screen displays correctly
- [ ] Service calls Edge Function with correct params
- [ ] Loading state shows during generation
- [ ] Success state displays generated image
- [ ] Error state shows user-friendly message
- [ ] Retake functionality still works

## Figma Design Reference

Loading screen design: https://www.figma.com/design/Tw819TjJmPG187n6eXbxZ9/Ora-for-Kerastase-🔮?node-id=6-656&m=dev

Key elements:
- Loading animation/spinner
- Progress indicator
- Descriptive text
- Consistent with app design system

## Risks & Mitigations

**Risk**: Google Gemini API rate limits
**Mitigation**: Implement retry logic with exponential backoff

**Risk**: Large image files causing timeouts
**Mitigation**: Compress images before sending, set appropriate timeout limits

**Risk**: Storage bucket filling up
**Mitigation**: Implement cleanup policy for old images

**Risk**: API key exposure
**Mitigation**: Use Supabase environment variables, never expose in frontend

## Success Criteria

- [ ] User can take a selfie
- [ ] Loading screen appears after capture
- [ ] Image is generated via Google Gemini
- [ ] Generated image is stored in Supabase Storage
- [ ] User sees generated image
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile-first design maintained
- [ ] Error states handled gracefully

## Next Steps

1. Ask for ticket number
2. Create git worktree: `git worktree add .developments/feature-image-generation`
3. Start with Phase 1: Backend Setup
4. Use appropriate agents for each phase
5. Follow TDD workflow throughout

## Notes

- Prompt is hardcoded for now: "Take this picture and make him happy to code now"
- Future enhancement: Dynamic prompt generation based on user tribe/subculture
- Consider adding progress updates during generation
- May need to optimize image size for API limits
