# Feature: Skeleton Loader for Results Screen

**Branch:** `feature/skeleton-loader-result`
**Date:** 2025-12-02
**Status:** Planning Phase

---

## 📋 Feature Overview

Replace the simple "Loading your results..." text with a polished skeleton loader that mimics the actual ResultsScreen layout. This provides better visual feedback and perceived performance during data fetching.

---

## 🎯 Requirements

### User-Confirmed Specifications
1. **Animation**: Shimmer gradient effect
2. **Architecture**: Generic reusable Skeleton component in `app/shared/components/`
3. **Elements to Include**:
   - Title text placeholder
   - Body text placeholder
   - 3 subculture card skeletons (rank, title, percentage, progress bar)
4. **Sizing**: Match exact dimensions of actual content
5. **Timing**: Minimum display duration (500ms) to prevent flickering
6. **Responsive**: Mobile-first with matching breakpoints

---

## 📁 File Structure

```
app/
├── shared/
│   └── components/
│       └── Skeleton/
│           ├── Skeleton.tsx              # ✨ NEW: Base skeleton component
│           ├── Skeleton.test.tsx         # ✨ NEW: Unit tests
│           └── index.ts                  # ✨ NEW: Barrel export
│
├── onboarding/
│   └── components/
│       ├── ResultsScreenSkeleton.tsx     # ✨ NEW: Results-specific skeleton
│       ├── ResultsScreenSkeleton.test.tsx # ✨ NEW: Component tests
│       ├── ResultsScreen.tsx             # 🔄 MODIFIED: Use skeleton
│       └── index.ts                      # 🔄 MODIFIED: Export skeleton
│
└── shared/
    └── hooks/
        ├── useMinimumLoadingTime.ts      # ✨ NEW: Custom hook for timing
        └── useMinimumLoadingTime.test.ts # ✨ NEW: Hook tests
```

---

## 🏗️ Architecture Design

### 1. Base Skeleton Component

**Location:** `app/shared/components/Skeleton/Skeleton.tsx`

**Purpose:** Generic, reusable skeleton component for the entire application

**Props Interface:**
```typescript
interface SkeletonProps {
  width?: string | number;        // e.g., "100%", 200, "20rem"
  height?: string | number;       // e.g., "2rem", 40
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'; // Border radius
  className?: string;             // Additional Tailwind classes
  animation?: 'shimmer' | 'pulse'; // Animation type (default: shimmer)
}
```

**Features:**
- Shimmer gradient animation using CSS keyframes
- Configurable dimensions and border radius
- Composable with Tailwind classes
- Accessible (aria-label="Loading")
- Supports both pixel and percentage-based sizing

**Animation Implementation:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

background: linear-gradient(
  90deg,
  #E5E7EB 25%,    /* Base gray */
  #F3F4F6 50%,    /* Lighter gray */
  #E5E7EB 75%     /* Base gray */
);
background-size: 200% 100%;
animation: shimmer 1.5s ease-in-out infinite;
```

---

### 2. Results Screen Skeleton Component

**Location:** `app/onboarding/components/ResultsScreenSkeleton.tsx`

**Purpose:** Specialized skeleton that mirrors the ResultsScreen layout

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ [ProgressIndicator - Real or Skip] │  ← Decision: Show real or skeleton?
├─────────────────────────────────────┤
│                                     │
│     ████████████████ (Title)        │  ← h1 title skeleton
│                                     │
├─────────────────────────────────────┤
│  ██████████████████████████ (Body)  │  ← Body text skeleton (2 lines)
│  ████████████████                   │
├─────────────────────────────────────┤
│                                     │
│  [01] ████████████  ██% Match       │  ← Card 1 (largest)
│  ═══════════════════════════        │     Progress bar
│                                     │
│  [02] ██████████    ██% Match       │  ← Card 2 (medium)
│  ═══════════════════════════        │
│                                     │
│  [03] ████████      ██% Match       │  ← Card 3 (smallest)
│  ═══════════════════════════        │
│                                     │
├─────────────────────────────────────┤
│  ████████████████████ (Button)      │  ← Button skeleton
└─────────────────────────────────────┘
```

**Key Dimensions (matching ResultsScreen):**
- Container: `max-w-[345px] md:max-w-4xl`
- Gap between sections: `gap-10 md:gap-12`
- Card 1 Title: `h1` equivalent (~48px mobile, ~60px desktop)
- Card 2 Title: `h2` equivalent (~40px mobile, ~48px desktop)
- Card 3 Title: `h3` equivalent (~32px mobile, ~40px desktop)
- Progress bar: `h-[4px]`
- Button: `h-[52px]`

**Responsive Behavior:**
- Uses same breakpoints as ResultsScreen (`md:`, `lg:`)
- Text skeletons scale proportionally
- Maintains spacing consistency

---

### 3. Minimum Loading Time Hook

**Location:** `app/shared/hooks/useMinimumLoadingTime.ts`

**Purpose:** Ensure skeleton displays for minimum duration to prevent flickering

**Hook Signature:**
```typescript
function useMinimumLoadingTime(
  isLoading: boolean,
  minimumDuration: number = 500
): boolean
```

**Logic:**
```typescript
// If loading starts, track the start time
// When loading finishes, check if minimum duration elapsed
// If not, delay the "done" state until minimum duration is met
// Return: shouldShowLoading (true if still in minimum period)
```

**Example Usage:**
```typescript
const [loadingState, setLoadingState] = useState<LoadingState>('loading');
const shouldShowLoading = useMinimumLoadingTime(
  loadingState === 'loading',
  500
);

if (shouldShowLoading) {
  return <ResultsScreenSkeleton />;
}
```

---

## 🧪 Test-Driven Development Plan

### Phase 1: Base Skeleton Component Tests (RED)

**File:** `app/shared/components/Skeleton/Skeleton.test.tsx`

**Test Cases:**
1. ✅ Renders with default props
2. ✅ Applies custom width and height
3. ✅ Applies rounded prop correctly
4. ✅ Merges custom className
5. ✅ Uses shimmer animation by default
6. ✅ Supports pulse animation
7. ✅ Has accessible loading label
8. ✅ Handles percentage-based dimensions
9. ✅ Handles pixel-based dimensions

---

### Phase 2: Minimum Loading Hook Tests (RED)

**File:** `app/shared/hooks/useMinimumLoadingTime.test.ts`

**Test Cases:**
1. ✅ Returns true when loading starts
2. ✅ Stays true for minimum duration even if loading finishes early
3. ✅ Returns false after minimum duration elapses
4. ✅ Returns false immediately if loading takes longer than minimum
5. ✅ Handles multiple loading cycles correctly
6. ✅ Uses custom minimum duration
7. ✅ Cleans up timers on unmount

---

### Phase 3: ResultsScreenSkeleton Tests (RED)

**File:** `app/onboarding/components/ResultsScreenSkeleton.test.tsx`

**Test Cases:**
1. ✅ Renders skeleton layout structure
2. ✅ Displays title skeleton
3. ✅ Displays body text skeleton (2 lines)
4. ✅ Displays 3 subculture card skeletons
5. ✅ Card skeletons have correct size hierarchy (h1 > h2 > h3)
6. ✅ Each card has rank, title, percentage, and progress bar skeletons
7. ✅ Displays button skeleton at bottom
8. ✅ Matches ResultsScreen container classes
9. ✅ Has proper responsive classes
10. ✅ Has accessible loading label

---

### Phase 4: Integration Tests (RED)

**File:** `app/onboarding/components/ResultsScreen.test.tsx` (update existing)

**Test Cases:**
1. ✅ Shows ResultsScreenSkeleton when loading
2. ✅ Skeleton displays for at least 500ms
3. ✅ Replaces skeleton with real content after data loads
4. ✅ Doesn't show skeleton when error occurs
5. ✅ Skeleton layout matches real content layout
6. ✅ Handles fast data fetch (< 500ms) correctly
7. ✅ Handles slow data fetch (> 500ms) correctly

---

## 📝 Implementation Steps (TDD Workflow)

### Step 1: Write Failing Tests
1. Create test files for Skeleton component
2. Create test files for useMinimumLoadingTime hook
3. Create test files for ResultsScreenSkeleton
4. Update ResultsScreen.test.tsx with skeleton tests
5. Run tests → **Expected: ❌ All FAIL** (components don't exist)

### Step 2: Implement Base Skeleton Component
1. Create `Skeleton.tsx` with props interface
2. Implement shimmer animation CSS
3. Implement render logic
4. Run tests → **Expected: ✅ Skeleton tests PASS**

### Step 3: Implement Minimum Loading Hook
1. Create `useMinimumLoadingTime.ts`
2. Implement timing logic with useEffect + setTimeout
3. Handle cleanup and edge cases
4. Run tests → **Expected: ✅ Hook tests PASS**

### Step 4: Implement ResultsScreenSkeleton
1. Create `ResultsScreenSkeleton.tsx`
2. Build layout structure using Skeleton components
3. Match dimensions and spacing from ResultsScreen
4. Add responsive classes
5. Run tests → **Expected: ✅ ResultsScreenSkeleton tests PASS**

### Step 5: Integrate into ResultsScreen
1. Import ResultsScreenSkeleton and useMinimumLoadingTime
2. Update loading state logic
3. Replace simple loading text with skeleton
4. Run tests → **Expected: ✅ Integration tests PASS**

### Step 6: Refactor & Polish
1. Extract magic numbers to constants
2. Improve CSS animations
3. Optimize component re-renders
4. Add comments for complex logic
5. Run tests → **Expected: ✅ All tests STILL PASS**

---

## ✅ Success Criteria

### Automated Tests
- [ ] All unit tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors or warnings

### Manual Browser Testing

#### Mobile (375px - iPhone SE)
- [ ] Skeleton displays correctly
- [ ] Animation is smooth
- [ ] Layout doesn't break
- [ ] No horizontal scroll
- [ ] Transitions cleanly to real content

#### Tablet (768px - iPad Mini)
- [ ] Responsive classes apply correctly
- [ ] Spacing scales appropriately

#### Desktop (1280px - MacBook)
- [ ] Skeleton looks polished
- [ ] Max-width constraints respected

#### Functional Testing
- [ ] Skeleton appears immediately on page load
- [ ] Skeleton displays for minimum 500ms
- [ ] Fast load (< 500ms): Skeleton still shows for 500ms
- [ ] Slow load (> 2s): Skeleton shows entire duration
- [ ] Clean transition from skeleton to real content
- [ ] No flickering or layout shift
- [ ] Error state bypasses skeleton (shows error immediately)

#### Animation Testing
- [ ] Shimmer gradient animates smoothly
- [ ] Animation loops continuously
- [ ] No performance issues (60fps)
- [ ] Animation stops when skeleton is replaced

#### Accessibility
- [ ] Screen reader announces loading state
- [ ] No keyboard traps
- [ ] Focus management works correctly

---

## 🎨 Design Specifications

### Color Palette (from Tailwind)
- **Base skeleton**: `#E5E7EB` (gray-200)
- **Shimmer highlight**: `#F3F4F6` (gray-100)
- **Background**: `#F9FAFB` (surface-light)

### Animation Timing
- **Shimmer duration**: 1.5s
- **Easing**: ease-in-out
- **Iteration**: infinite
- **Minimum display**: 500ms

### Spacing (matching ResultsScreen)
- **Container padding**: `p-6 md:p-8`
- **Section gaps**: `gap-10 md:gap-12`
- **Card gaps**: `gap-8`
- **Internal card gaps**: `gap-3`

---

## 🚀 Performance Considerations

### Optimization Strategies
1. **CSS-based animation** (not JS) for 60fps
2. **will-change: transform** on shimmer for GPU acceleration
3. **Memoize ResultsScreenSkeleton** to prevent re-renders
4. **Use CSS custom properties** for theming if needed
5. **Lazy-load shimmer gradient** only when needed

### Bundle Size Impact
- **Estimated addition**: ~2KB (component + hook)
- **No external dependencies** required
- **Reusable across app** (positive ROI)

---

## 🔄 Backwards Compatibility

### Changes to Existing Code
- **ResultsScreen.tsx**: Update loading state (lines 46-54)
- **No breaking changes** to API or props
- **Existing tests** may need updates for new skeleton

### Migration Path
- Zero migration needed
- Drop-in replacement for loading state
- Fully backwards compatible

---

## 📚 Future Enhancements (Out of Scope)

1. **Skeleton variants**: Cards, lists, tables, forms
2. **Theming support**: Dark mode skeleton colors
3. **Animation presets**: Wave, fade, slide
4. **Smart skeleton**: AI-generated based on component tree
5. **Storybook stories**: Visual documentation
6. **Performance monitoring**: Track skeleton display duration

---

## 🐛 Potential Edge Cases

1. **Very fast network** (< 100ms): Minimum 500ms prevents flickering ✅
2. **Network timeout**: Error state bypasses skeleton ✅
3. **Multiple rapid reloads**: Hook cleans up timers ✅
4. **Component unmount during loading**: Cleanup in useEffect ✅
5. **Slow animations on low-end devices**: CSS-based, hardware-accelerated ✅

---

## 📋 Pre-Development Checklist

### Planning Phase
- [x] Requirement fully understood
- [x] Clarifying questions asked and answered
- [x] Affected files identified
- [x] Edge cases and error scenarios documented
- [x] Test scenarios defined

### Implementation Phase (Test-Driven Development)
- [ ] Write failing unit tests (Skeleton component)
- [ ] Write failing unit tests (useMinimumLoadingTime hook)
- [ ] Write failing component tests (ResultsScreenSkeleton)
- [ ] Write failing integration tests (ResultsScreen)
- [ ] Implement minimal code to pass tests
- [ ] Add error handling
- [ ] Refactor for code quality
- [ ] Use framer-motion for consistency if needed

### Validation Phase
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Manual browser testing completed
  - [ ] Happy path verified (smooth loading → content)
  - [ ] Fast load verified (< 500ms delay enforced)
  - [ ] Slow load verified (skeleton shows entire time)
  - [ ] Error state verified (skeleton bypassed)
  - [ ] Mobile viewport (375px, 428px)
  - [ ] Tablet viewport (768px, 1024px)
  - [ ] Desktop viewport (1280px, 1920px)
  - [ ] Animation performance checked (60fps)
- [ ] Production build successful (`npm run build`)
- [ ] Production server tested (`npm start`)
- [ ] No console errors or warnings

### Performance Phase
- [ ] Animation performance verified (60fps)
- [ ] Bundle size impact checked (< 5KB)
- [ ] No unnecessary re-renders

### Quality Assurance
- [ ] Code follows screaming architecture
- [ ] Mobile-first design verified
- [ ] Accessibility verified
- [ ] No regressions introduced
- [ ] Shimmer animation is smooth
- [ ] Skeleton matches actual content layout

---

## 🎯 Definition of Done

This feature is complete when:

1. ✅ All automated tests pass
2. ✅ Type checking passes without errors
3. ✅ Production build succeeds
4. ✅ Manual testing confirms smooth loading experience
5. ✅ Skeleton matches ResultsScreen layout exactly
6. ✅ Minimum 500ms display duration enforced
7. ✅ No visual flickering or layout shift
8. ✅ Shimmer animation runs smoothly at 60fps
9. ✅ Responsive design works across all breakpoints
10. ✅ Code is documented and follows project standards

---

## 📞 Questions & Decisions Log

### Decision 1: Animation Style
- **Question**: What animation style?
- **Answer**: Shimmer gradient
- **Date**: 2025-12-02

### Decision 2: Component Architecture
- **Question**: Generic or specific component?
- **Answer**: Generic Skeleton component in shared/
- **Date**: 2025-12-02

### Decision 3: Elements to Include
- **Question**: Which elements to skeleton?
- **Answer**: Title, body text, 3 subculture cards (exclude ProgressIndicator)
- **Date**: 2025-12-02

### Decision 4: Minimum Duration
- **Question**: Prevent flickering?
- **Answer**: Yes, 500ms minimum display
- **Date**: 2025-12-02

### Decision 5: Responsive Design
- **Question**: Match breakpoints?
- **Answer**: Yes, mobile-first with matching breakpoints
- **Date**: 2025-12-02

### Decision 6: ProgressIndicator in Skeleton
- **Question**: Include ProgressIndicator in skeleton?
- **Answer**: No, skip it (not needed for loading feedback)
- **Date**: 2025-12-02

### Decision 7: Animation Library
- **Question**: Use framer-motion or pure CSS?
- **Answer**: Pure CSS animations (lighter, better performance)
- **Date**: 2025-12-02

### Decision 8: Dark Mode Support
- **Question**: Plan for dark mode skeleton colors?
- **Answer**: No, out of scope (implement when dark mode is added)
- **Date**: 2025-12-02

---

## ✅ IMPLEMENTATION READY

**Branch**: `feature/skeleton-loader-result` ✅
**Plan**: Complete and approved ✅
**Next Step**: Write failing tests (TDD Red phase) ✅

---

**END OF IMPLEMENTATION PLAN**
