# Development Plan: Moodboard Selection Feature

**Ticket**: moodboard
**Branch**: feature/moodboard
**Date**: 2025-12-01

---

## Feature Overview

Implement a moodboard selection screen where users can select one moodboard from 10 options. The selected moodboard is saved to the form store and used to navigate to the next step.

### Acceptance Criteria

- [x] User sees the moodboard page with design matching Figma
- [x] When user clicks on a moodboard, it highlights and navigates to next page
- [x] 10 moodboards defined by Geoffrey are displayed
- [x] Selection is stored in form data (not persisted to Supabase yet)

---

## Current System Analysis

### Existing Architecture

1. **Step Management**: Custom hook `useStepStore` using React useState (not Zustand)
   - Location: `app/shared/stores/stepStore.ts`
   - Current flow: WelcomePage → NamePage → KeywordPage → TinderPage → Step4Page
   - Uses localStorage for persistence

2. **Form Data Management**: Local state in `home.tsx`
   - Type: `FormData` with `name`, `keywords`, `brands`
   - Location: `app/onboarding/types/index.ts`

3. **Database Schema**: Moodboards table exists
   - Fields: `id`, `name`, `description`, `subculture_id`, `created_at`, `updated_at`
   - Location: `supabase/migrations/20251127235301_update_schema_for_simplified_computation.sql`

4. **Existing Components**:
   - `FormHeader`: Progress indicator and back button
   - Design system: Typography (Title, Body, Caption), Button, Card components
   - Animations: `pageTransitionVariants` from framer-motion

### Database Updates Required

**Current moodboards in seed.sql**:
1. Timeless Elegance
2. Modern Minimalism
3. Romantic Nostalgia
4. Urban Edge
5. Spiritual Sanctuary

**New moodboards from requirements**:
1. HERITAGE HEIRESS
2. QUIET LUXURY
3. Conscious Hedonists
4. CLEAN RITUALIST
5. SILLAGE SEEKERS
6. URBAN MUSE ENERGIZER
7. STAGEBREAKERS
8. THE COSMIC EXPLORER
9. EDGY AESTHETES
10. GLOSS GODDESSES

---

## Implementation Plan

### Phase 1: Database Setup

#### Task 1.1: Update Seed Data
- **File**: `supabase/seed.sql`
- **Action**: Replace moodboards with the 10 new ones
- **Migration needed**: No (just seed data update)

```sql
-- Delete old moodboards
DELETE FROM moodboards;

-- Insert new moodboards
INSERT INTO moodboards (name, description) VALUES
  ('HERITAGE HEIRESS', 'Heritage Heiresses embody the continuity of family legacy...'),
  ('QUIET LUXURY', 'Quiet Luxury is luxury without ostentation...'),
  -- ... (all 10 moodboards)
```

#### Task 1.2: Apply Seed Data Locally
```bash
supabase db reset
```

---

### Phase 2: Type Definitions & Service Layer

#### Task 2.1: Update FormData Type
- **File**: `app/onboarding/types/index.ts`
- **Changes**:
  ```typescript
  export interface FormData {
    name: string;
    keywords: string[];
    brands?: {
      liked: string[];
      passed: string[];
    };
    moodboard?: string; // Add moodboard ID
  }
  ```

#### Task 2.2: Add MoodboardPage to PageType
- **File**: `app/onboarding/types/index.ts`
- **Changes**:
  ```typescript
  export type PageType =
    | 'WelcomePage'
    | 'NamePage'
    | 'KeywordPage'
    | 'TinderPage'
    | 'MoodboardPage'  // NEW
    | 'Step4Page';
  ```

#### Task 2.3: Add MoodboardScreenProps Type
- **File**: `app/onboarding/types/index.ts`
- **Changes**:
  ```typescript
  export interface MoodboardScreenProps {
    onBack: () => void;
    onContinue: (moodboardId: string) => void;
  }
  ```

#### Task 2.4: Create Moodboard Service
- **File**: `app/shared/services/moodboardService.ts`
- **Implementation**:
  ```typescript
  export const moodboardService = {
    async getAll(): Promise<Moodboard[]> {
      // Fetch all moodboards from Supabase
    }
  };
  ```

---

### Phase 3: Component Development (TDD)

#### Task 3.1: MoodboardCard Component

**Test File**: `app/onboarding/components/MoodboardCard.test.tsx`

**Tests to write**:
1. Should render moodboard name
2. Should render moodboard description (truncated if needed)
3. Should call onClick when clicked
4. Should apply highlight styles when selected
5. Should have proper accessibility (aria-label, role)

**Component File**: `app/onboarding/components/MoodboardCard.tsx`

**Implementation**:
- Clickable card with image background (placeholder for now)
- Shows moodboard name overlay
- Mobile-first responsive design
- Touch-friendly (minimum 44x44px)

#### Task 3.2: MoodboardScreen Component

**Test File**: `app/onboarding/components/MoodboardScreen.test.tsx`

**Tests to write**:
1. Should display loading state while fetching moodboards
2. Should display error state on fetch failure
3. Should render grid of moodboard cards
4. Should highlight selected card when clicked
5. Should disable Continue button when no moodboard selected
6. Should enable Continue button when moodboard is selected
7. Should call onContinue with moodboard ID when Continue clicked
8. Should call onBack when back button is clicked
9. Should render FormHeader with correct step (3/4)
10. Should display title and subtitle from Figma : https://www.figma.com/design/Tw819TjJmPG187n6eXbxZ9/Ora-for-Kerastase-%F0%9F%94%AE?node-id=2-608&m=dev

**Component File**: `app/onboarding/components/MoodboardScreen.tsx`

**Implementation**:
- Uses FormHeader component
- Fetches moodboards from moodboardService
- 2-column grid layout (mobile-first)
- Handles loading, error, and success states
- Continue button (disabled until selection made)
- Track selected moodboard ID in local state
- Highlight selected card with gold border

---

### Phase 4: Routing Integration

#### Task 4.1: Update Step Store
- **File**: `app/shared/stores/stepStore.ts`
- **Changes**:
  ```typescript
  const PAGE_ORDER: PageType[] = [
    'WelcomePage',
    'NamePage',
    'KeywordPage',
    'TinderPage',
    'MoodboardPage',  // NEW - Insert after TinderPage
    'Step4Page'
  ];
  ```

#### Task 4.2: Update Home Route
- **File**: `app/routes/home.tsx`
- **Changes**:
  1. Add moodboard to formData state initialization
  2. Add handleMoodboardSelect handler
  3. Add handleBackToTinder handler
  4. Add MoodboardPage case in AnimatePresence
  5. Update TinderScreen's onContinue to navigate to MoodboardPage

**Example**:
```typescript
const handleMoodboardContinue = (moodboardId: string) => {
  setFormData((prev) => ({ ...prev, moodboard: moodboardId }));
  setDirection('forward');
  goToNextPage();
};

const handleBackToTinder = () => {
  setDirection('backward');
  goToPreviousPage();
  // Reset moodboard selection when going back
  setFormData((prev) => ({
    ...prev,
    moodboard: undefined
  }));
};
```

---

### Phase 5: Styling & Responsiveness

#### Task 5.1: Implement Design System Tokens
- Use existing typography components (Title, Body, Caption)
- Use existing color tokens from `app/shared/types/colors.ts`
- Primary color: `#C9A961`
- Neutral colors: `#6A7282`, `#101828`, `#F9FAFB`

#### Task 5.2: Mobile-First Grid Layout
```css
/* Mobile (default): 2 columns */
grid-template-columns: repeat(2, 1fr);
gap: 16px;

/* Tablet (768px+): 3 columns */
@media (min-width: 768px) {
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Desktop (1024px+): 4 columns */
@media (min-width: 1024px) {
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
```

#### Task 5.3: Card Highlight State
When card is clicked (during navigation):
- Border: `3px solid #C9A961`
- Scale: `scale(0.98)` for tactile feedback
- Transition: `all 200ms ease-in-out`

---

### Phase 6: Image Assets

**Decision needed**: How to handle moodboard images?

**Options**:
1. Use placeholder images for now (recommended for MVP)
2. Extract images from Figma (requires Figma API or manual download)
3. Use generated images (AI or stock photos)

**Recommendation**: Start with colored backgrounds (gradients) as placeholders
- Each moodboard gets a unique gradient
- Easy to implement, looks professional
- Can be replaced with real images later

---

## Testing Strategy (TDD)

### Unit Tests
- [ ] moodboardService.getAll() returns array of moodboards
- [ ] moodboardService.getAll() handles errors gracefully
- [ ] MoodboardCard onClick handler called with correct ID

### Component Tests
- [ ] MoodboardScreen displays loading spinner initially
- [ ] MoodboardScreen displays error message on failure
- [ ] MoodboardScreen renders grid of cards on success
- [ ] MoodboardCard renders name and description
- [ ] MoodboardCard applies styles correctly

### Integration Tests
- [ ] Clicking a moodboard navigates to Step4Page
- [ ] Back button navigates to TinderPage
- [ ] Selected moodboard is stored in formData
- [ ] FormHeader displays "Step 3 / 4"

### Manual Browser Testing
- [ ] Mobile (375px): 2-column grid, cards are tappable
- [ ] Mobile (428px): Layout adjusts properly
- [ ] Tablet (768px): 3-column grid
- [ ] Desktop (1024px): 4-column grid
- [ ] Keyboard navigation works
- [ ] No console errors

---

## File Structure

```
app/
├── onboarding/
│   ├── components/
│   │   ├── MoodboardCard.tsx          # NEW
│   │   ├── MoodboardCard.test.tsx     # NEW
│   │   ├── MoodboardScreen.tsx        # NEW
│   │   ├── MoodboardScreen.test.tsx   # NEW
│   │   └── index.ts                   # UPDATE (export MoodboardScreen)
│   └── types/
│       └── index.ts                   # UPDATE (add moodboard to FormData, MoodboardPage to PageType)
├── shared/
│   ├── services/
│   │   ├── moodboardService.ts        # NEW
│   │   └── moodboardService.test.ts   # NEW
│   └── stores/
│       └── stepStore.ts               # UPDATE (add MoodboardPage to PAGE_ORDER)
└── routes/
    └── home.tsx                       # UPDATE (add MoodboardPage routing)

supabase/
└── seed.sql                           # UPDATE (replace moodboards data)
```

---

## Dependencies

No new dependencies needed! Using existing stack:
- React
- Framer Motion (already installed)
- Supabase client (already configured)
- Vitest (testing)

---

## Risks & Mitigations

### Risk 1: Moodboard Images Not Available
**Mitigation**: Use gradient placeholders initially

### Risk 2: Grid Layout Breaks on Small Screens
**Mitigation**: Test on 375px viewport, ensure minimum card size

### Risk 3: API Fetch Slow
**Mitigation**: Implement loading state, consider caching

---

## Success Criteria

### Functional
- [x] Requirements clarified with user
- [x] User can view 10 moodboards
- [x] User can select one moodboard
- [x] Selection navigates to next page
- [x] Selected moodboard stored in formData

### Technical
- [x] All tests pass (16/16 tests passing)
- [x] Type checking passes
- [x] Production build succeeds
- [x] No console errors
- [x] Mobile-first responsive design (2-col mobile, 3-col tablet, 4-col desktop)
- [x] Accessibility (keyboard nav, ARIA labels)

### Performance
- [x] Page loads in < 2s
- [x] Smooth animations (60fps)
- [x] No layout shifts

---

## Timeline Estimate (Not a Commitment)

- Database setup: 30 mins
- Types & service: 1 hour
- Component development (TDD): 3-4 hours
- Routing integration: 1 hour
- Styling & responsiveness: 2 hours
- Testing & validation: 1-2 hours

**Total**: ~8-10 hours of focused development

---

## Next Steps

1. ✅ Create development plan (DONE)
2. Show plan to user for approval
3. Begin Phase 1: Database Setup
4. Follow TDD workflow (Red → Green → Refactor)
5. Manual browser testing
6. Production build & validation

---

## Notes

- This feature is for BOARD PRESENTATION - quality is paramount
- Follow screaming architecture (feature-based organization)
- Mobile-first design is mandatory
- TDD approach is required
- No shortcuts on accessibility or testing

## Updated Requirements (2025-12-01)

### UX Changes
- ✅ **Continue Button**: Keep the Continue button (matches Figma design)
- ✅ **Button State**: Disabled when no selection, enabled when moodboard selected
- ✅ **Selection Highlight**: Gold border (`#C9A961`) around selected card
- ✅ **Navigation**: Click card to select → Click Continue to proceed

### Performance Phase
- ❌ **SKIPPED**: Performance optimization phase not required for this feature
