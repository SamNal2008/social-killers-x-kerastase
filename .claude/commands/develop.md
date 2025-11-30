# Development Workflow Command

IMPORTANT : EVERY TIME WRITE YOUR PLAN AND CONTEXT IN A MD FILE SO I CAN CONTINUE IF NEEDED

## Overview

This command enforces the Test-Driven Development workflow for implementing new features. For codebase standards and best practices, see `CLAUDE.md`.

When queried, ask me to provided the feature to implement

Select if you should respect all plan depending on if the feature need frontend development or only supabase development

## Before everything

- Checkout on main : `gco main`
- Pull latest changes : `gl`
- Create a git worktree to develop your own feature : `git worktree add .developments/feature-name`
- The feature name should always be : `feature/ticket-number` so ask the ticket if needed

---

## Pre-Development Checklist

**MANDATORY: Always create and display this checklist before starting any feature development**

```markdown
## Feature: [Feature Name]

### Planning Phase
- [ ] Requirement fully understood
- [ ] Clarifying questions asked and answered
- [ ] Affected files identified
- [ ] Edge cases and error scenarios documented
- [ ] Test scenarios defined

### Implementation Phase (Test-Driven Development)
- [ ] Write failing unit tests
- [ ] Write failing component tests
- [ ] Implement minimal code to pass tests
- [ ] Add error handling
- [ ] Add loading states
- [ ] Refactor for code quality
- [ ] Use best agents depending on the task needed to implement the feature 

### Validation Phase
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Manual browser testing completed
  - [ ] Happy path verified
  - [ ] Error states verified
  - [ ] Loading states verified
  - [ ] Mobile viewport (375px, 428px)
  - [ ] Tablet viewport (768px, 1024px)
  - [ ] Desktop viewport (1280px, 1920px)
  - [ ] Keyboard navigation works
- [ ] Production build successful (`npm run build`)
- [ ] Production server tested (`npm start`)
- [ ] No console errors or warnings

### Performance Phase (After functionality validated)
- [ ] Performance audit completed
- [ ] Optimizations applied if needed
- [ ] Bundle size checked

### Quality Assurance
- [ ] Code follows screaming architecture (see CLAUDE.md)
- [ ] No sensitive data exposed
- [ ] Responsive design verified (mobile-first)
- [ ] Accessibility verified
- [ ] No regressions introduced
```

---

## Test-Driven Development (TDD) Workflow

**Red → Green → Refactor** - This is the ONLY way to develop features.

### Step 1: RED - Write Failing Tests

#### 1.1 Write Failing Unit Tests

```typescript
// features/users/utils/formatUserName.test.ts
import { describe, it, expect } from 'vitest';
import { formatUserName } from './formatUserName';

describe('formatUserName', () => {
  it('should format full name correctly', () => {
    expect(formatUserName({ firstName: 'John', lastName: 'Doe' }))
      .toBe('John Doe');
  });

  it('should handle missing last name', () => {
    expect(formatUserName({ firstName: 'John', lastName: '' }))
      .toBe('John');
  });

  it('should handle empty names', () => {
    expect(formatUserName({ firstName: '', lastName: '' }))
      .toBe('Anonymous');
  });
});
```

**Run**: `npm test -- formatUserName`

**Expected**: ❌ Tests FAIL (function doesn't exist yet)

#### 1.2 Write Failing Component Tests

```typescript
// features/users/components/UserProfile.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';
import { userService } from '../services/userService';

vi.mock('../services/userService');

describe('UserProfile', () => {
  it('should display loading state initially', () => {
    vi.mocked(userService.getById).mockImplementation(
      () => new Promise(() => {})
    );

    render(<UserProfile userId="123" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display user data when loaded', async () => {
    vi.mocked(userService.getById).mockResolvedValue({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    });

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display error state on failure', async () => {
    vi.mocked(userService.getById).mockRejectedValue(
      new Error('Network error')
    );

    render(<UserProfile userId="123" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

**Run**: `npm test -- UserProfile`

**Expected**: ❌ Tests FAIL (component doesn't exist yet)

### Step 2: GREEN - Implement Minimal Code

#### 2.1 Implement to Pass Unit Tests

```typescript
// features/users/utils/formatUserName.ts
interface UserName {
  firstName: string;
  lastName: string;
}

export const formatUserName = ({ firstName, lastName }: UserName): string => {
  if (!firstName && !lastName) return 'Anonymous';
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};
```

**Run**: `npm test -- formatUserName`

**Expected**: ✅ Tests PASS

#### 2.2 Implement to Pass Component Tests

```typescript
// features/users/components/UserProfile.tsx
import type { FC } from 'react';

interface Props {
  userId: string;
}

export const UserProfile: FC<Props> = ({ userId }) => {
  const { data, isLoading, error } = useUser(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NotFound />;

  return <div className="user-profile">{data.name}</div>;
};
```

**Run**: `npm test -- UserProfile`

**Expected**: ✅ Tests PASS

### Step 3: REFACTOR - Improve Code Quality

Now that tests pass, refactor to improve:
- Code readability
- UI/UX (styling, responsive design)
- Error messages
- Accessibility

```typescript
// features/users/components/UserProfile.tsx (refactored)
import type { FC } from 'react';

interface Props {
  userId: string;
}

export const UserProfile: FC<Props> = ({ userId }) => {
  const { data, isLoading, error } = useUser(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  if (!data) {
    return <NotFound message="User not found" />;
  }

  return (
    <div className="user-profile p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
        {data.name}
      </h1>
    </div>
  );
};
```

**Run**: `npm test`

**Expected**: ✅ All tests STILL PASS (refactoring shouldn't break tests)

---

## Manual Browser Testing

**MANDATORY: Test in browser after tests pass**

### Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:<PORT>`

### Testing Checklist

#### Mobile-First Testing (Start Here)

1. **Resize browser to 375px width** (iPhone SE)
   - [ ] Layout works properly
   - [ ] Text is readable
   - [ ] Buttons are tappable (minimum 44x44px)
   - [ ] No horizontal scroll
   - [ ] Forms are usable

2. **Resize to 428px width** (iPhone 14 Pro Max)
   - [ ] Layout adjusts properly
   - [ ] Touch targets are adequate

#### Tablet Testing

3. **Resize to 768px width** (iPad Mini)
   - [ ] Layout uses tablet styles
   - [ ] Content is properly spaced

4. **Resize to 1024px width** (iPad Pro)
   - [ ] Layout transitions smoothly

#### Desktop Testing

5. **Resize to 1280px width** (MacBook)
   - [ ] Layout uses desktop styles
   - [ ] Content isn't too stretched

6. **Resize to 1920px width** (Full HD)
   - [ ] Layout looks good at large sizes
   - [ ] Max-width constraints applied where needed

#### Functional Testing

- [ ] **Happy Path**: Feature works as expected
- [ ] **Error Path**: Trigger errors (disconnect network, invalid input)
  - [ ] Error messages are user-friendly
  - [ ] UI doesn't break on error
- [ ] **Loading Path**: Check loading states
  - [ ] Loading indicators appear
  - [ ] No flash of content

#### Design testing

- [ ]Run the app by using playwright mcp to run the app
- [ ] And then check the figma design to ensure it matches

#### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dialogs
- [ ] Focus indicators are visible

#### Console Check

- [ ] No errors in console
- [ ] No warnings in console
- [ ] Network tab shows reasonable requests

---

## Automated Validation

**Run these commands before committing:**

### 1. Type Checking

```bash
npm run typecheck
```

**Expected**: ✅ No type errors

**If fails**:
- Fix type errors
- Re-run until passes

### 2. All Tests

```bash
npm test
```

**Expected**: ✅ All tests pass

**If fails**:
- Fix failing tests
- Re-run until all pass

### 3. Production Build

```bash
npm run build
```

**Expected**: ✅ Build succeeds

**If fails**:
- Check build errors
- Often related to:
  - Type errors not caught by typecheck
  - Missing dependencies
  - Environment variables
- Fix and re-run

### 4. Test Production Build

```bash
npm start
```

Navigate to production server and verify feature works.

**Expected**: ✅ Feature works in production build

---

## Performance Optimization (After Functionality Works)

**ONLY perform these steps AFTER all tests pass and manual testing is complete.**

### Performance Audit

1. **Check Bundle Size**
   ```bash
   npm run build
   du -sh build/client
   ```
   - Should be under reasonable limits (e.g., 5MB)

2. **Lighthouse Audit** (in Chrome DevTools)
   - Performance: 90+
   - Accessibility: 100
   - Best Practices: 100
   - SEO: 90+

3. **Identify Issues**
   - Large bundle size
   - Slow component renders
   - Unnecessary re-renders
   - Large images

### Apply Optimizations (If Needed)

#### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

#### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
export const ExpensiveList = memo(({ items }) => {
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
});

// Memoize expensive calculations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.value - b.value);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

#### Image Optimization

- Use WebP format
- Implement lazy loading
- Provide multiple sizes
- Compress images

**Re-run tests after optimization**:
```bash
npm test
```

**Expected**: ✅ Tests still pass after optimization

---

## Commit Workflow

### Pre-Commit Verification

Before committing, ensure:

- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Manual browser testing complete
- [ ] No console errors
- [ ] Code follows architecture guidelines (see CLAUDE.md)
- [ ] No sensitive data in code

### Commit Message Format

Use conventional commits:

```bash
<type>(<scope>): <description>

# Examples:
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(dashboard): resolve data refresh issue"
git commit -m "test(users): add unit tests for user service"
git commit -m "refactor(content): extract image generation to service"
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `docs`: Documentation
- `style`: Code formatting
- `perf`: Performance improvement
- `chore`: Build/tooling changes

---

## Troubleshooting

### Tests Failing

```bash
# Run specific test file
npm test -- path/to/test.test.ts

# Run in watch mode
npm test -- --watch

# Run with coverage to see what's not tested
npm test -- --coverage
```

### Type Errors

```bash
# Run type checking
npm run typecheck

# Common fixes:
# - Add missing type imports
# - Define proper interfaces
# - Use type guards for unknowns
# - Check generated types in .react-router/types
```

### Build Failing

```bash
# Check build output
npm run build

# Common issues:
# - Missing environment variables
# - Type errors in production mode
# - Import path issues
# - Missing dependencies
```

### Browser Issues

- **Clear browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- **Check network tab**: Look for failed requests
- **Check console**: Look for errors
- **Verify dev server is running**: `npm run dev`

---

## Summary

### TDD Workflow (Always Follow This)

1. ✅ **Display Pre-Development Checklist**
2. ❌ **RED**: Write failing tests
3. ✅ **GREEN**: Implement minimal code to pass tests
4. ♻️ **REFACTOR**: Improve code while keeping tests green
5. 🌐 **Manual Browser Testing** (mobile-first)
6. 🔍 **Automated Validation** (typecheck, test, build)
7. ⚡ **Performance** (only after functionality works)
8. 💾 **Commit** (with conventional commit message)

### Key Principles

- **Mobile-First**: Always design for mobile, then enhance
- **Tests First**: Red → Green → Refactor
- **No Regressions**: All checks must pass before commit
- **Performance Last**: Optimize after functionality is verified
- **See CLAUDE.md**: For all code quality standards and architecture

### Quick Commands

```bash
npm run dev              # Start dev server
npm test                 # Run tests
npm test -- --watch      # Run tests in watch mode
npm run typecheck        # Type checking
npm run build            # Production build
npm start                # Test production build
```

**Remember**: Quality over speed. Do it right the first time.