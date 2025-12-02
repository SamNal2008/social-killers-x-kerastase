# UI Polishing Feature Plan

**Branch**: `feature/UI-polishing`
**Date**: 2025-12-02
**Status**: Planning Complete

---

## Overview

This feature addresses two UI/UX improvements:
1. **Auto-scroll to top** when navigating between question screens in the onboarding flow
2. **Redesign details screen UI** with inspiration from Co-Star app, using existing design tokens and components

---

## Current State Analysis

### Design System Inventory

#### Design Tokens (from `app/app.css`)
- **Fonts**:
  - Crimson Pro (serif) - for titles
  - Inter (sans-serif) - for body text
- **Font Sizes**: h0 (44px), h1 (36px), h2 (24px), h3 (20px), body-1 (16px), body-2 (14px)
- **Colors**:
  - Primary: `#c9a961` (gold)
  - Neutral Dark: `#101828`
  - Neutral White: `#ffffff`
  - Neutral Gray: `#6a7282`
  - Surface Light: `#f9fafb`
- **Letter Spacing**: 2px for captions

#### Existing Components
- Typography: `Title`, `Body`, `Caption`
- Buttons: `Button` (primary, secondary, tertiary, disabled)
- Form: `Input`, `Badge`, `FormHeader`
- Other: `Polaroid`, `CircleButton`

### Onboarding Flow Structure

**Question Screens** (all follow same pattern):
1. `NameScreen` (step 1/4) - Name input
2. `MoodboardScreen` (step 2/4) - Image selection
3. `KeywordsScreen` (step 3/4) - Keyword selection
4. `TinderScreen` (step 4/4) - Brand swipes

**Common Pattern**:
```tsx
<div className="bg-surface-light min-h-screen p-6 md:p-8">
  <motion.div className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-md mx-auto">
    <FormHeader currentStep={X} totalSteps={4} onBack={onBack} />
    {/* Main content with Title, Body, Input/Interactive elements, CTA Button */}
  </motion.div>
</div>
```

### Current Details Screen (`app/features/subculture-details/components/DetailsScreen.tsx`)

**Structure**:
- Light background (`bg-surface-light`)
- Back button (top left)
- Header section: Caption → Title
- Decorative gradient line
- Content: Subtitle → Description
- DO/DON'T section (side-by-side columns)
- CTA button (Generate AI moodboard)

**Issues Identified**:
- Light background may lack visual impact
- DO/DON'T columns cramped on mobile (uses `flex-1` side-by-side)
- Could benefit from better spacing and typography hierarchy
- Decorative line could be more prominent

---

## Requirements

### Issue 1: Auto-Scroll on Navigation

**Problem**: When user scrolls down to click a CTA button, the next question screen maintains the same scroll position, requiring manual scroll up to see the question.

**Solution**: Implement scroll-to-top behavior when entering any question screen.

**Affected Files**:
- `app/onboarding/components/NameScreen.tsx`
- `app/onboarding/components/MoodboardScreen.tsx`
- `app/onboarding/components/KeywordsScreen.tsx`
- `app/onboarding/components/TinderScreen.tsx`

**Implementation Approach**:
- Create a custom hook `useScrollToTop` that scrolls window to top on mount
- Apply to all question screens
- Use `useEffect` with empty deps array
- Smooth scroll behavior for better UX

### Issue 2: Details Screen Redesign

**Goal**: Improve UI/UX inspired by Co-Star's minimalist, elegant design

**Co-Star Design Principles** (from screenshots):
- Dark theme with strong contrast
- Serif typography for headings
- Clean, centered layout
- Clear content hierarchy
- Ample breathing space
- DO/DON'T sections with clear separation

**Proposed Changes**:

1. **Color Scheme**:
   - Consider darker/more contrasted background
   - Use existing `neutral-dark` for more impact
   - Maintain accessibility (WCAG AA contrast ratios)

2. **Typography Hierarchy**:
   - Keep Crimson Pro for titles (matches Co-Star serif style)
   - Ensure proper sizing and line-height for readability
   - Better spacing between sections

3. **Layout Improvements**:
   - **DO/DON'T section**: Stack vertically on mobile instead of side-by-side
   - Use `flex-col` on mobile, `flex-row` on larger screens
   - Better spacing between items

4. **Spacing**:
   - Increase gaps between major sections for breathing room
   - Consistent padding/margins

5. **Decorative Elements**:
   - Keep the gradient line but make it more subtle or prominent based on design
   - Consider additional visual separators if needed

**Constraints**:
- Use ONLY existing design tokens and components
- No new fonts
- Mobile-first approach
- Maintain all existing functionality
- Keep animations and transitions

---

## Implementation Plan

### Phase 1: Auto-Scroll Implementation

**Step 1: Create Custom Hook**
- File: `app/shared/hooks/useScrollToTop.ts` (new file)
- Implement hook with `useEffect` and `window.scrollTo`
- Add smooth scroll behavior
- Write unit tests

**Step 2: Apply Hook to Question Screens**
- Import and use `useScrollToTop` in:
  - `NameScreen.tsx`
  - `MoodboardScreen.tsx`
  - `KeywordsScreen.tsx`
  - `TinderScreen.tsx`
- Update component tests to verify scroll behavior

**Step 3: Test**
- Manual testing: Navigate through onboarding flow and verify scroll
- Automated tests: Mock `window.scrollTo` and verify it's called

### Phase 2: Details Screen Redesign

**Step 1: Create Updated DetailsScreen Component**
- Work in: `app/features/subculture-details/components/DetailsScreen.tsx`
- Implement mobile-first responsive design
- Changes:
  - Update DO/DON'T section layout:
    - Mobile: `flex flex-col gap-8`
    - Tablet+: `md:flex-row md:gap-12`
  - Improve spacing (increase gaps)
  - Refine typography hierarchy
  - Consider background color adjustments
  - Ensure content max-widths work well on all screens

**Step 2: Update Component Tests**
- File: `app/features/subculture-details/components/DetailsScreen.test.tsx`
- Verify all existing tests pass
- Add tests for responsive behavior if needed

**Step 3: Visual QA**
- Compare with Co-Star inspiration
- Test on multiple viewport sizes
- Ensure accessibility

### Phase 3: Validation

**Automated Checks**:
- `npm run typecheck` - TypeScript validation
- `npm test` - All tests pass
- `npm run build` - Production build succeeds

**Manual Testing**:
- Mobile viewports: 375px, 428px
- Tablet viewports: 768px, 1024px
- Desktop viewports: 1280px, 1920px
- Keyboard navigation
- Screen reader compatibility (if applicable)

---

## Test Strategy

### Unit Tests

**Auto-Scroll Hook** (`useScrollToTop.test.ts`):
```typescript
describe('useScrollToTop', () => {
  it('should scroll to top on mount', () => {
    // Mock window.scrollTo
    // Render hook
    // Verify scrollTo called with { top: 0, behavior: 'smooth' }
  });

  it('should not scroll on re-renders', () => {
    // Verify scrollTo only called once
  });
});
```

**Question Screen Tests**:
- Verify hook is called on mount
- Existing tests should continue to pass

**DetailsScreen Tests**:
- All existing functionality tests pass
- Layout renders correctly
- DO/DON'T items display properly
- Responsive behavior works

### Integration Tests

- Navigate through full onboarding flow
- Verify scroll behavior between screens
- Verify details screen displays correctly after results

### Manual Testing Checklist

- [ ] Auto-scroll works on all question screens
- [ ] Details screen looks good on mobile (375px, 428px)
- [ ] Details screen looks good on tablet (768px, 1024px)
- [ ] Details screen looks good on desktop (1280px, 1920px)
- [ ] DO/DON'T section stacks vertically on mobile
- [ ] DO/DON'T section displays side-by-side on tablet+
- [ ] Typography hierarchy is clear
- [ ] Spacing feels comfortable (not cramped)
- [ ] All interactive elements work
- [ ] Keyboard navigation works
- [ ] No console errors or warnings

---

## Edge Cases & Considerations

### Auto-Scroll
- **SSR compatibility**: Ensure `window` exists before calling `scrollTo`
- **Smooth vs instant**: Use smooth scroll for better UX, but consider reduced-motion preferences
- **Timing**: Scroll should happen after component mounts but before animations start (or early in animation)

### Details Screen
- **Long content**: Ensure long descriptions and DO/DON'T lists don't break layout
- **Empty states**: Handle missing data gracefully (already handled, verify it still works)
- **Accessibility**: Maintain color contrast ratios (WCAG AA minimum: 4.5:1 for normal text)
- **Touch targets**: Ensure back button and CTA button are large enough (44x44px minimum)

---

## Files to Create/Modify

### New Files
- `app/shared/hooks/useScrollToTop.ts`
- `app/shared/hooks/useScrollToTop.test.ts`

### Modified Files
- `app/onboarding/components/NameScreen.tsx`
- `app/onboarding/components/MoodboardScreen.tsx`
- `app/onboarding/components/KeywordsScreen.tsx`
- `app/onboarding/components/TinderScreen.tsx`
- `app/features/subculture-details/components/DetailsScreen.tsx`
- `app/features/subculture-details/components/DetailsScreen.test.tsx` (verify tests pass)
- `app/onboarding/components/NameScreen.test.tsx` (verify tests pass)
- `app/onboarding/components/KeywordsScreen.test.tsx` (verify tests pass)
- `app/onboarding/components/TinderScreen.test.tsx` (verify tests pass)

---

## Success Criteria

### Auto-Scroll
- [x] Custom hook created and tested
- [ ] Hook applied to all question screens
- [ ] All tests pass
- [ ] Manual testing confirms scroll behavior works smoothly
- [ ] No regressions in existing functionality

### Details Screen
- [x] Current implementation analyzed
- [ ] UI improved with better spacing and layout
- [ ] Mobile-first responsive design implemented
- [ ] DO/DON'T section stacks on mobile, side-by-side on larger screens
- [ ] All existing tests pass
- [ ] Manual testing on all viewports confirms improvements
- [ ] Accessibility maintained (WCAG AA)
- [ ] No regressions in existing functionality

### Overall
- [ ] TypeScript type checking passes
- [ ] All automated tests pass
- [ ] Production build succeeds
- [ ] Manual testing complete on all target viewports
- [ ] Code follows screaming architecture
- [ ] No console errors or warnings
- [ ] Ready for PR review

---

## Notes

- Existing animations and transitions should be preserved
- All functionality must remain intact
- Follow mobile-first approach for all responsive changes
- Use TDD workflow: Write tests first, implement, refactor
- This is for board presentation - quality and stability are critical

---

## Next Steps

1. Set up git worktree: `git worktree add .developments/UI-polishing feature/UI-polishing`
2. Start with Phase 1: Auto-scroll implementation (TDD)
3. Move to Phase 2: Details screen redesign (TDD)
4. Complete Phase 3: Validation and testing
5. Create PR for review
