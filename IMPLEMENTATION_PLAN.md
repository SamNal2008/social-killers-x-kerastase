# Moodboard Screen Improvements - Implementation Plan

**Feature Branch**: `fix/moodboard-screen`
**Date**: 2025-12-02
**Status**: In Progress

---

## 📋 Summary

Improve the moodboard selection screen by:
1. Removing subculture names and descriptions from cards
2. Adding zoom functionality for users to inspect moodboards in detail
3. Maintaining existing selection UX

---

## 🎯 User Experience Flow

### Before
- Cards show moodboard image with name (e.g., "UNAPOLOGETIC") and description overlay
- User clicks card to select
- Text can obscure moodboard details

### After
- Cards show only moodboard image (no text overlay)
- Magnifier icon (🔍) in top-right corner
- Click magnifier → Opens fullscreen zoom modal
- Click card → Selects moodboard
- Zoom modal supports pinch-to-zoom for detailed inspection

---

## 📁 Files Structure

### New Files
```
app/shared/components/ZoomModal/
├── ZoomModal.tsx          # Main zoom modal component
├── ZoomModal.test.tsx     # Unit tests
└── index.ts               # Export barrel
```

### Modified Files
```
app/onboarding/components/
├── MoodboardCard.tsx      # Remove text, add magnifier
└── MoodboardCard.test.tsx # Update tests
```

---

## 🔧 Technical Details

### ZoomModal Component

**Props:**
```typescript
interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText: string;
}
```

**Features:**
- Fullscreen overlay (fixed position, z-50)
- Black backdrop (80% opacity)
- Image: centered, responsive, supports pinch-to-zoom
- Close methods:
  - Click backdrop
  - Click X button
  - Press ESC key
- Accessibility:
  - Focus trap
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-label` on buttons

**Icon Used:** `ZoomIn` from `lucide-react`

### MoodboardCard Updates

**Removals:**
- Lines 54-59: Name and description content
- Gradient overlay (optional - may keep for visual depth)

**Additions:**
- Magnifier button (top-right, absolute positioning)
  - Size: 44x44px (touch-friendly)
  - Background: Black 50% opacity
  - Hover: Black 70% opacity
  - Icon: `ZoomIn` from lucide-react (white)
  - Click handler: `e.stopPropagation()` to prevent card selection
- ZoomModal integration with local state

---

## ✅ Test Scenarios

### Unit Tests - ZoomModal
- [ ] Renders when `isOpen={true}`
- [ ] Does not render when `isOpen={false}`
- [ ] Calls `onClose` when backdrop clicked
- [ ] Calls `onClose` when ESC pressed
- [ ] Calls `onClose` when close button clicked
- [ ] Displays image with correct src and alt
- [ ] Has proper ARIA attributes

### Component Tests - MoodboardCard
- [ ] Does not render name text
- [ ] Does not render description text
- [ ] Renders magnifier button
- [ ] Magnifier button has proper touch target (44x44px)
- [ ] Clicking magnifier opens zoom modal
- [ ] Clicking magnifier does NOT select card
- [ ] Clicking card (outside magnifier) selects card
- [ ] Selected state still shows golden border
- [ ] Zoom modal shows correct image

### Manual Browser Tests
- [ ] **Mobile 375px**: Touch targets work, pinch-to-zoom works
- [ ] **Mobile 428px**: Layout responsive
- [ ] **Tablet 768px**: Modal sizing appropriate
- [ ] **Desktop 1280px**: Modal centered, image scales correctly
- [ ] **Keyboard nav**: Tab to magnifier, Enter opens modal, ESC closes
- [ ] **Screen reader**: Announces buttons and states correctly

---

## 📊 Implementation Progress

### Phase 1: ZoomModal Component ✅
- [x] Write failing tests for ZoomModal
- [x] Implement ZoomModal component
- [x] Polish styles and animations
- [x] Accessibility features

### Phase 2: MoodboardCard Updates
- [ ] Write failing tests for updated MoodboardCard
- [ ] Remove text content
- [ ] Add magnifier button
- [ ] Integrate ZoomModal
- [ ] Polish interactions

### Phase 3: Manual Testing
- [ ] Test mobile viewports (375px, 428px)
- [ ] Test zoom gestures (pinch-to-zoom)
- [ ] Test selection still works correctly
- [ ] Test keyboard navigation
- [ ] Test screen reader

### Phase 4: Validation
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (all tests)
- [ ] `npm run build` succeeds
- [ ] Production server tested
- [ ] No console errors/warnings

---

## 🎨 Design Specifications

### Magnifier Button
```css
Position: absolute top-2 right-2
Size: 44x44px (w-11 h-11)
Border-radius: 50% (rounded-full)
Background: rgba(0, 0, 0, 0.5) hover:rgba(0, 0, 0, 0.7)
Icon: ZoomIn (lucide-react), white color, 20x20px
Z-index: 20 (above image, below modal)
Transition: background 200ms
```

### Zoom Modal
```css
Container: fixed inset-0 z-50
Backdrop: bg-black/80
Image Container: flex items-center justify-center, p-4
Image: max-w-full max-h-[90vh], touch-action: pinch-zoom
Close Button: absolute top-4 right-4, 44x44px
Animation: fade-in 200ms (framer-motion)
```

### Card Changes
```css
Remove:
- h3 (name text)
- p (description text)
- Gradient overlay (optional)

Keep:
- aspect-[3/4]
- border/ring on selected
- hover states
- background image
```

---

## 🔄 Edge Cases

1. **Missing image URL**: Hide magnifier button, show placeholder
2. **Image load failure**: Show error in modal with retry option
3. **Double-click**: Prevent with disabled state during animation
4. **Mobile safe areas**: Use `safe-area-inset` for notched devices
5. **Very large images**: Limit max-width in modal, enable pan/zoom
6. **Accessibility**: All interactive elements keyboard accessible

---

## 📝 Notes

- Using native browser pinch-to-zoom (no external library needed)
- Framer-motion for smooth animations (already in project)
- Lucide-react for icons (already in project)
- Mobile-first approach throughout
- No breaking changes to existing API/props
- Selection logic remains unchanged

---

## ✅ Acceptance Criteria

- [ ] Cards display only moodboard images (no text)
- [ ] Magnifier icon visible and tappable on all cards
- [ ] Clicking magnifier opens zoom modal
- [ ] Zoom modal shows enlarged moodboard image
- [ ] Pinch-to-zoom works on mobile
- [ ] Clicking card (not magnifier) still selects it
- [ ] Selected state visual feedback unchanged
- [ ] ESC closes modal
- [ ] Backdrop click closes modal
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Production build succeeds
- [ ] No accessibility violations
- [ ] Works on all breakpoints (375px - 1920px)

---

## 🚀 Deployment

Once approved:
1. Merge `fix/moodboard-screen` into `main`
2. Deploy to production
3. Test on actual devices
4. Monitor for issues

---

**Last Updated**: 2025-12-02
**Developer**: Claude Code
**Reviewer**: Romain Lagrange
