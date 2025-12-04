# Plan: Moodboard Image Import from Dashboard

## Feature Overview

Add a button on the Dashboard that opens a dialog to import moodboard images for each subculture. The dialog displays all subcultures with file upload inputs next to each. When an image is uploaded, it saves to the Supabase storage bucket and updates the corresponding moodboard's `image_url` in the database. Only uploaded images are updated - if no file is provided for a subculture, its existing image remains unchanged.

## Context

### Current State
- **Dashboard**: Located at `/dashboard` route, displays user results as polaroid cards
- **Moodboards**: Each moodboard has a `subculture_id` and `image_url` field
- **Storage**: `generated-images` bucket exists with public read access
- **Subcultures**: Stored in `subcultures` table with `name`, `description`, etc.

### Key Files
- `app/features/dashboard/components/DashboardScreen.tsx` - Dashboard component
- `app/shared/services/moodboardService.ts` - Moodboard data service
- `app/shared/services/supabase.ts` - Supabase client
- `app/shared/types/database.types.ts` - TypeScript database types

---

## Pre-Development Checklist

### Planning Phase
- [x] Requirement fully understood
- [x] Clarifying questions asked and answered
- [x] Affected files identified
- [x] Edge cases and error scenarios documented
- [x] Test scenarios defined

### Implementation Phase (Test-Driven Development)
- [x] Write failing unit tests
- [x] Write failing component tests
- [x] Implement minimal code to pass tests
- [x] Add error handling
- [x] Add loading states
- [x] Refactor for code quality

### Validation Phase
- [x] All tests pass (`npm test`) - 348 tests passed
- [x] Type checking passes (`npm run typecheck`)
- [ ] Manual browser testing completed
- [x] Production build successful (`npm run build`)
- [ ] No console errors or warnings

---

## Implementation Plan

### Phase 1: Create Storage Bucket for Moodboard Images (Supabase)

**Location**: `supabase/migrations/YYYYMMDDHHMMSS_add_moodboard_images_bucket.sql`

Create a dedicated storage bucket for moodboard images (separate from generated-images):
- Bucket name: `moodboard-images`
- Public read access
- Allow authenticated uploads
- Supported formats: image/jpeg, image/png, image/webp
- File size limit: 10MB

### Phase 2: Create Moodboard Upload Service

**Location**: `app/features/dashboard/services/moodboardUploadService.ts`

Service functions:
1. `fetchSubculturesWithMoodboards()` - Get all subcultures with their current moodboard image URLs
2. `uploadMoodboardImage(file: File, subcultureId: string)` - Upload image to storage
3. `updateMoodboardImageUrl(moodboardId: string, imageUrl: string)` - Update DB record

Types needed:
```typescript
interface SubcultureWithMoodboard {
  id: string;
  name: string;
  moodboardId: string;
  currentImageUrl: string | null;
}

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
```

### Phase 3: Create Dialog Component

**Location**: `app/features/dashboard/components/MoodboardImportDialog/`

Files:
- `MoodboardImportDialog.tsx` - Main dialog component
- `MoodboardImportDialog.test.tsx` - Component tests
- `SubcultureUploadRow.tsx` - Individual row with file input
- `SubcultureUploadRow.test.tsx` - Row component tests
- `types.ts` - TypeScript types
- `index.ts` - Barrel export

Component structure:
```
MoodboardImportDialog
├── Dialog overlay (reuse ZoomModal pattern)
├── Header with title and close button
├── List of SubcultureUploadRow components
│   ├── Subculture name
│   ├── Current image thumbnail (if exists)
│   ├── File input (hidden)
│   ├── Upload button
│   ├── Upload progress/status
│   └── Preview of selected file
├── Action buttons
│   ├── Cancel
│   └── Save (upload all selected files)
└── Loading/Error states
```

### Phase 4: Add Import Button to Dashboard

**Location**: `app/features/dashboard/components/DashboardScreen.tsx`

Add:
1. State for dialog open/close
2. Import button in header section
3. MoodboardImportDialog component

### Phase 5: Testing

**Unit Tests**:
- `moodboardUploadService.test.ts` - Service functions

**Component Tests**:
- `MoodboardImportDialog.test.tsx` - Dialog behavior
- `SubcultureUploadRow.test.tsx` - Upload row behavior

---

## Technical Details

### File Upload Flow

1. User clicks "Import Moodboards" button on dashboard
2. Dialog opens, fetching subcultures with current moodboard data
3. User selects files for one or more subcultures
4. User clicks "Save"
5. For each selected file:
   a. Upload to `moodboard-images` bucket with path: `{subcultureId}/{timestamp}_{filename}`
   b. Get public URL
   c. Update moodboard record in database
6. Close dialog on success, show error on failure

### Validation Rules

- File types: JPEG, PNG, WebP only
- Max file size: 10MB
- At least one file must be selected to enable Save button

### Edge Cases

1. **No image selected for a subculture** → Skip that subculture (don't overwrite)
2. **Upload fails** → Show error, don't update DB, allow retry
3. **DB update fails** → Rollback/delete uploaded file if possible
4. **Dialog closed during upload** → Cancel pending uploads
5. **Subculture has no moodboard** → Create moodboard record or skip
6. **Large files** → Show progress, handle timeout

### Error Handling

- Display user-friendly error messages
- Log errors for debugging
- Allow partial success (some uploads succeed, some fail)
- Show which uploads failed with specific error messages

---

## File Structure (Feature-based)

```
app/features/dashboard/
├── components/
│   ├── DashboardScreen.tsx (modified)
│   ├── DashboardPolaroid.tsx (unchanged)
│   └── MoodboardImportDialog/
│       ├── MoodboardImportDialog.tsx
│       ├── MoodboardImportDialog.test.tsx
│       ├── SubcultureUploadRow.tsx
│       ├── SubcultureUploadRow.test.tsx
│       ├── types.ts
│       └── index.ts
├── services/
│   ├── dashboardService.ts (unchanged)
│   ├── moodboardUploadService.ts (new)
│   └── moodboardUploadService.test.ts (new)
├── hooks/
│   └── useMoodboardImport.ts (new - optional)
├── types/
│   └── index.ts (modified if needed)
└── utils/
    └── formatTimestamp.ts (unchanged)
```

---

## Dependencies

- **framer-motion**: Already installed (for dialog animations)
- **lucide-react**: Already installed (for icons)
- No new dependencies required

---

## Implementation Order

1. **Phase 1**: Storage bucket migration (Supabase)
2. **Phase 2**: Upload service with tests (TDD)
3. **Phase 3**: Dialog components with tests (TDD)
4. **Phase 4**: Dashboard integration
5. **Phase 5**: Manual testing & refinement

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| File upload timeout | Medium | Medium | Implement progress indicator, reasonable timeout |
| Storage quota exceeded | Low | High | Monitor bucket size, implement cleanup if needed |
| RLS policy issues | Medium | Medium | Test with authenticated user, verify policies |
| Large file blocking UI | Medium | High | Use async upload, show progress |

---

## Status

**Current Phase**: Implementation Complete - Ready for Manual Testing

**Completed**:
- [x] Phase 1: Skipped - bucket `moodboard-images` already exists
- [x] Phase 2: Upload service with tests (11 tests)
- [x] Phase 3: Dialog components with tests (26 tests)
- [x] Phase 4: Dashboard integration
- [ ] Phase 5: Manual browser testing

**Files Created**:
- `app/features/dashboard/services/moodboardUploadService.ts`
- `app/features/dashboard/services/moodboardUploadService.test.ts`
- `app/features/dashboard/components/MoodboardImportDialog/MoodboardImportDialog.tsx`
- `app/features/dashboard/components/MoodboardImportDialog/MoodboardImportDialog.test.tsx`
- `app/features/dashboard/components/MoodboardImportDialog/SubcultureUploadRow.tsx`
- `app/features/dashboard/components/MoodboardImportDialog/SubcultureUploadRow.test.tsx`
- `app/features/dashboard/components/MoodboardImportDialog/types.ts`
- `app/features/dashboard/components/MoodboardImportDialog/index.ts`

**Files Modified**:
- `app/features/dashboard/components/DashboardScreen.tsx` - Added import button and dialog

**Next Steps**:
1. Manual browser testing at http://localhost:5173/dashboard
2. Verify all responsive breakpoints
3. Test keyboard navigation

