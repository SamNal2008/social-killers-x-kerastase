# Feature Implementation Plan: Camera Selfie Screen

**Ticket**: KERASTASE-18
**Date**: 2025-12-01
**Developer**: Claude Code

---

## Feature Summary

Implement a camera/selfie screen that allows users to take a selfie for AI moodboard generation. The screen appears after the DetailsScreen when clicking "Generate my AI moodboard".

### Acceptance Criteria

- ✅ Appears after subculture details screen (DetailsScreen)
- ✅ Triggered by "Generate my AI moodboard" button (already present in DetailsScreen.tsx:204-210)
- ✅ Shows camera permission request
- ✅ Once accepted, camera access works without re-prompting
- ✅ If refused, shows permission request again
- ✅ Matches Figma design: https://www.figma.com/design/Tw819TjJmPG187n6eXbxZ9/Ora-for-Kerastase-🔮?node-id=4-405&m=dev
- ✅ Handle browser compatibility gracefully (nice message if camera not supported)
- ✅ For now: just display the user's captured picture (no backend upload yet)

---

## Pre-Development Checklist

### Planning Phase
- [ ] Requirement fully understood ✅
- [ ] Clarifying questions asked and answered ✅
- [ ] Affected files identified (see below)
- [ ] Edge cases and error scenarios documented (see below)
- [ ] Test scenarios defined (see below)

### Implementation Phase (Test-Driven Development)
- [ ] Write failing unit tests (camera service, hooks)
- [ ] Write failing component tests (CameraScreen)
- [ ] Implement minimal code to pass tests
- [ ] Add error handling
- [ ] Add loading states
- [ ] Refactor for code quality
- [ ] Use appropriate architecture (screaming architecture)

### Validation Phase
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Manual browser testing completed
  - [ ] Happy path verified (camera permission granted, selfie taken)
  - [ ] Error states verified (permission denied, camera not available)
  - [ ] Loading states verified
  - [ ] Mobile viewport (375px, 428px)
  - [ ] Tablet viewport (768px, 1024px)
  - [ ] Desktop viewport (1280px, 1920px)
  - [ ] Keyboard navigation works
- [ ] Production build successful (`npm run build`)
- [ ] Production server tested (`npm start`)
- [ ] No console errors or warnings

### Design Validation
- [ ] Matches Figma design
- [ ] Mobile-first responsive design
- [ ] Accessibility verified (WCAG AA)
- [ ] Touch targets minimum 44x44px

### Quality Assurance
- [ ] Code follows screaming architecture (feature-based organization)
- [ ] No sensitive data exposed
- [ ] TypeScript strict mode (no `any` types)
- [ ] Self-documenting code (clear names, no method docs)
- [ ] No regressions introduced

---

## Affected Files

### New Files to Create

1. **Feature Directory Structure**
   ```
   app/features/camera-selfie/
   ├── components/
   │   ├── CameraScreen.tsx
   │   ├── CameraScreen.test.tsx
   │   ├── CameraView.tsx (camera preview component)
   │   ├── CameraView.test.tsx
   │   └── PermissionPrompt.tsx (permission request UI)
   ├── hooks/
   │   ├── useCamera.ts
   │   └── useCamera.test.ts
   ├── services/
   │   ├── cameraService.ts
   │   └── cameraService.test.ts
   ├── types/
   │   └── index.ts
   └── utils/
       ├── cameraUtils.ts
       └── cameraUtils.test.ts
   ```

2. **Route File**
   - `app/routes/camera.tsx` (new route)

### Files to Modify

1. **Routing**
   - `app/routes.ts` - Add camera route

2. **Navigation**
   - `app/features/subculture-details/components/DetailsScreen.tsx` - Add onClick handler to button (line 204-210)

---

## Edge Cases & Error Scenarios

### Browser Compatibility
- ✅ Browser doesn't support `navigator.mediaDevices`
- ✅ Browser doesn't support `getUserMedia`
- ✅ User is on HTTP instead of HTTPS (camera requires HTTPS)

### Permission States
- ✅ Permission granted → Show camera preview
- ✅ Permission denied → Show permission denied message with instructions
- ✅ Permission prompt dismissed → Re-show permission request
- ✅ Permission previously denied → Show instructions to enable in browser settings

### Camera Access
- ✅ No camera device available
- ✅ Camera in use by another application
- ✅ Multiple cameras available (front/back) → Default to front camera

### User Actions
- ✅ User closes/navigates away during camera access
- ✅ User takes selfie → Display captured image
- ✅ User retakes selfie → Allow retake
- ✅ User cancels/goes back

---

## Test Scenarios

### Camera Service Tests
1. **Browser Support Detection**
   - ✅ Returns `true` when `navigator.mediaDevices.getUserMedia` exists
   - ✅ Returns `false` when `navigator.mediaDevices` doesn't exist
   - ✅ Returns `false` when `getUserMedia` doesn't exist

2. **Camera Permission Request**
   - ✅ Successfully requests camera permission
   - ✅ Handles permission denied error
   - ✅ Handles NotAllowedError (user denied permission)
   - ✅ Handles NotFoundError (no camera device)

3. **Camera Stream Management**
   - ✅ Returns media stream when permission granted
   - ✅ Stops camera stream when called
   - ✅ Handles errors when stopping stream

### useCamera Hook Tests
1. **Initial State**
   - ✅ Starts with `idle` state
   - ✅ Stream is `null`
   - ✅ Error is `null`

2. **Request Camera Access**
   - ✅ Changes state to `requesting` when requesting access
   - ✅ Changes state to `active` when permission granted
   - ✅ Sets stream when permission granted
   - ✅ Changes state to `denied` when permission denied
   - ✅ Changes state to `unsupported` when browser doesn't support camera

3. **Stop Camera**
   - ✅ Stops stream and sets state to `idle`
   - ✅ Clears stream reference

4. **Capture Photo**
   - ✅ Captures photo from video stream
   - ✅ Returns base64 image data
   - ✅ Handles errors during capture

### CameraScreen Component Tests
1. **Rendering States**
   - ✅ Shows loading state initially
   - ✅ Shows unsupported message when browser doesn't support camera
   - ✅ Shows permission prompt when permission not granted
   - ✅ Shows camera preview when permission granted
   - ✅ Shows captured photo after taking selfie
   - ✅ Shows error message when camera access fails

2. **User Interactions**
   - ✅ Clicking "Allow Camera" requests camera permission
   - ✅ Clicking "Capture" takes a selfie
   - ✅ Clicking "Retake" returns to camera preview
   - ✅ Back button navigates to previous screen

3. **Accessibility**
   - ✅ All interactive elements have proper ARIA labels
   - ✅ Keyboard navigation works
   - ✅ Focus management is correct

---

## Implementation Plan

### Phase 1: Camera Service & Utils (TDD)
1. Write failing tests for camera utility functions
2. Write failing tests for camera service
3. Implement camera utilities
4. Implement camera service

### Phase 2: useCamera Hook (TDD)
1. Write failing tests for useCamera hook
2. Implement useCamera hook
3. Verify all hook tests pass

### Phase 3: Camera Components (TDD)
1. Write failing tests for PermissionPrompt component
2. Write failing tests for CameraView component
3. Write failing tests for CameraScreen component
4. Implement PermissionPrompt component
5. Implement CameraView component
6. Implement CameraScreen component

### Phase 4: Routing & Navigation
1. Create camera route file
2. Update routes.ts
3. Update DetailsScreen button onClick handler
4. Test navigation flow

### Phase 5: Refactor & Design
1. Apply Figma design styles
2. Ensure mobile-first responsive design
3. Add animations (if in Figma)
4. Refactor for code quality

### Phase 6: Validation
1. Run all tests
2. Run type checking
3. Build production
4. Manual browser testing
5. Verify Figma design match

---

## Technical Decisions

### State Management
- Use discriminated union for camera states:
  ```typescript
  type CameraState =
    | { status: 'idle' }
    | { status: 'requesting' }
    | { status: 'active'; stream: MediaStream }
    | { status: 'denied' }
    | { status: 'unsupported' }
    | { status: 'error'; error: Error }
  ```

### Camera API
- Use `navigator.mediaDevices.getUserMedia()` API
- Request video constraints: `{ video: { facingMode: 'user' } }` (front camera)

### Image Capture
- Use Canvas API to capture frame from video element
- Return base64 encoded image data URI

### Permission Handling
- Check permission status before requesting
- Provide clear instructions for re-enabling denied permissions
- Handle all permission states gracefully

### Browser Compatibility
- Feature detect `navigator.mediaDevices.getUserMedia`
- Show graceful fallback message if not supported
- Note: Camera requires HTTPS (except localhost)

---

## Navigation Flow

```
DetailsScreen
    ↓ (click "Generate my AI moodboard")
CameraScreen (route: /camera)
    ↓ (if browser unsupported)
    → Show unsupported message
    ↓ (if permission needed)
    → Show permission prompt
    ↓ (if permission granted)
    → Show camera preview
    ↓ (click "Capture")
    → Show captured photo
    ↓ (for now: just display)
    → (Future: upload to backend, generate moodboard)
```

---

## Design Notes

- Check Figma design for:
  - Camera preview layout
  - Capture button style and position
  - Permission prompt UI
  - Error message styling
  - Captured photo display
  - Mobile vs desktop layouts

- Ensure:
  - Mobile-first approach
  - Touch targets ≥ 44x44px
  - Clear visual feedback for all states
  - Accessible color contrast

---

## Next Steps

1. ✅ Checklist created
2. ⏳ Start Phase 1: Write failing tests for camera service
3. Continue TDD workflow (Red → Green → Refactor)
