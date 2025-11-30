# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application with server-side rendering (SSR) enabled, connected to a Supabase backend, and using LLM APIs for content generation (images, responses). It uses Vite as the build tool and TailwindCSS for styling.

**Project Context**: This application will be presented to a board, so stability, security, and quality are paramount.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with HMR (http://localhost:5173)
npm run build            # Build for production
npm start                # Start production server (serves from ./build/server/index.js)
npm run typecheck        # Run TypeScript type checking

# Testing
npm test                 # Run tests
npm test -- --coverage   # Run tests with coverage
npm test -- --watch      # Run tests in watch mode
npm run test:e2e         # Run E2E tests (if configured)
```

## Architecture

### Screaming Architecture (Mandatory)

Organize code by **feature/domain**, not by technical type. This makes the codebase self-documenting and reduces cognitive load.

```
app/
├── features/
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── README.md
│   ├── content-generation/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── README.md
│   └── dashboard/
├── shared/
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Reusable custom hooks
│   ├── services/        # Shared services (supabase, logger, etc.)
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utility functions
└── routes/              # Route components only
```

**Package Complexity Rules**:
- Maximum folder depth: 3 levels
- Maximum files per folder: 10 files
- When limits are exceeded, split into sub-features or extract to shared

### Routing System
- Routes are defined in `app/routes.ts` using React Router v7's file-based routing configuration
- Route files live in `app/routes/` directory
- Currently uses a single index route pointing to `routes/home.tsx`
- Routes use the `RouteConfig` type from `@react-router/dev/routes`

### Application Structure
- **Root Layout**: `app/root.tsx` defines the HTML document structure with `Layout` component
  - Includes global error boundary with `ErrorBoundary` component
  - Handles 404s and unexpected errors with appropriate messaging
  - Stack traces shown in development mode only
- **Type Generation**: React Router auto-generates types in `.react-router/types/` directory
- **Path Aliases**: Uses `~/*` to reference `app/*` (configured in tsconfig.json)

### Build Configuration
- **Vite Config** (`vite.config.ts`):
  - TailwindCSS Vite plugin for styling
  - React Router plugin for SSR/routing
  - TSConfig paths plugin for module resolution
- **React Router Config** (`react-router.config.ts`):
  - SSR enabled by default (`ssr: true`)
  - Can be disabled for SPA mode if needed

## Code Quality Standards

### Dependencies

Do not add dependencies manually, use `npm install <PACKAGE_NAME>` so the version is the one already compatible with the project.

Before adding dependencies, ensure the package is not already in the project and that I really want to add it by asking me.

### TypeScript Rules (Strict Enforcement)

1. **Type Everything Explicitly** - Never use `any`, use `unknown` and type guards instead
   ```typescript
   // ✅ Good
   interface User {
     id: string;
     email: string;
     createdAt: Date;
   }

   const getUser = async (id: string): Promise<User | null> => {
     // implementation
   }

   // ❌ Bad
   const getUser = async (id) => {
     // implementation
   }
   ```

2. **Use Discriminated Unions for States**
   ```typescript
   // ✅ Good
   type AsyncState<T> =
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: T }
     | { status: 'error'; error: Error }

   // ❌ Bad
   type AsyncState<T> = {
     loading: boolean;
     data?: T;
     error?: Error;
   }
   ```

3. **Configuration**:
   - Strict mode enabled
   - Target: ES2022
   - Module resolution: bundler
   - JSX: react-jsx (automatic runtime)
   - Types include Node and Vite client types
   - `.react-router/types` added as root directory for generated route types

### React Best Practices

1. **Component Structure**
   ```typescript
   // ✅ Good - Clear separation of concerns
   import type { FC } from 'react';

   interface Props {
     userId: string;
   }

   export const UserProfile: FC<Props> = ({ userId }) => {
     const { data, isLoading, error } = useUser(userId);

     if (isLoading) return <LoadingSpinner />;
     if (error) return <ErrorMessage error={error} />;
     if (!data) return <NotFound />;

     return (
       <div className="user-profile">
         {/* component content */}
       </div>
     );
   };
   ```

2. **Hooks Rules**
   - Extract complex logic into custom hooks
   - Name custom hooks with `use` prefix
   - Keep hooks focused on a single responsibility
   - Place hooks in `features/[feature]/hooks/` or `shared/hooks/`

3. **Error Boundaries**
   - Wrap route components with error boundaries
   - Provide meaningful error messages
   - Log errors for monitoring

### Code Self-Documentation (No Method Docs)

**NO method/parameter documentation comments** - Code should be self-descriptive through:

```typescript
// ✅ Good - Self-descriptive names
const calculateMonthlySubscriptionPrice = (
  basePrice: number,
  discountPercentage: number
): number => {
  const discountAmount = basePrice * (discountPercentage / 100);
  return basePrice - discountAmount;
};

// ✅ Good - Type makes intent clear
interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const createUser = async (input: CreateUserInput): Promise<User> => {
  // implementation
};

// ❌ Bad - Needs documentation because names are unclear
/**
 * Calculates price
 * @param p - price
 * @param d - discount
 */
const calc = (p: number, d: number): number => {
  return p - (p * d / 100);
};
```

**Only add comments for**:
- Complex business logic that isn't obvious from code
- Non-obvious workarounds or hacks
- WHY a decision was made (not WHAT the code does)

```typescript
// ✅ Good - Explains WHY
// Supabase RLS requires the session to be set before querying
// We cache for 5 minutes to reduce auth checks during active sessions
const SESSION_CACHE_DURATION = 5 * 60 * 1000;

// ❌ Bad - States the obvious
// This function gets a user by ID
const getUserById = async (id: string) => { ... }
```

## Styling Standards (Mobile-First)

### TailwindCSS Configuration
- Uses TailwindCSS v4.1+ via Vite plugin
- Global styles in `app/app.css`
- Inter font loaded from Google Fonts in root layout

### Mobile-First Approach (Mandatory)

**Always design for mobile first, then progressively enhance for larger screens.**

```typescript
// ✅ Good - Mobile-first, progressive enhancement
<button
  className="
    // Mobile (default - 375px and up)
    w-full
    px-4 py-3
    text-sm

    // Tablet (768px and up)
    md:w-auto
    md:px-6 md:py-2
    md:text-base

    // Desktop (1024px and up)
    lg:px-8

    // Shared styles
    bg-blue-600 hover:bg-blue-700
    text-white font-medium
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-colors duration-200
  "
>
  Submit
</button>

// ❌ Bad - Desktop-first, no mobile consideration
<button className="px-8 py-2 bg-blue-600 text-white">
  Submit
</button>
```

### Responsive Breakpoints
- **Default (base)**: 375px - 767px (mobile)
- **`sm:`**: 640px (large mobile)
- **`md:`**: 768px (tablet)
- **`lg:`**: 1024px (desktop)
- **`xl:`**: 1280px (large desktop)
- **`2xl:`**: 1536px (extra large)

### Touch Targets
- Minimum touch target: 44x44px (iOS) / 48x48px (Android)
- Add padding to make small elements tappable

```typescript
// ✅ Good - Proper touch target
<button className="p-3 text-sm">Icon</button>

// ❌ Bad - Too small for touch
<button className="p-1 text-xs">Icon</button>
```

### Accessibility (Mandatory)
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, etc.)
- Include ARIA labels where semantic HTML isn't sufficient
- Ensure keyboard navigation works (Tab, Enter, Escape)
- Maintain color contrast ratios (WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text)
- Test with screen readers when applicable

## Backend Integration

### Supabase Service Layer Pattern

**Always use a service layer to interact with Supabase:**

```typescript
// features/users/services/userService.ts
import { supabase } from '~/shared/services/supabase';
import type { User } from '../types';

export const userService = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch user: ${error.message}`);
    return data;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }
};
```

### Security Rules (Critical)

- **Never expose API keys in client code** - Use environment variables
- **Use Row Level Security (RLS)** in Supabase for all tables
- **Validate all inputs** before sending to database (use Zod or similar)
- **Implement proper authentication** - Use Supabase's built-in auth
- **Rate limiting** - Implement for API endpoints and LLM calls

```typescript
// ✅ Good - Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ❌ Bad - Hardcoded
const supabaseUrl = 'https://xyz.supabase.co';
```

### Input Validation (Mandatory)

```typescript
// ✅ Good - Validate all inputs
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const createUser = async (input: unknown) => {
  const validated = createUserSchema.parse(input);
  return userService.create(validated);
};

// ❌ Bad - No validation
const createUser = async (input: any) => {
  return userService.create(input);
};
```

## LLM Integration

### API Call Structure

All request and response bodies on the web part should be in camelCase

```typescript
// features/content-generation/services/llmService.ts
interface GenerateImageRequest {
  prompt: string;
  style?: string;
  size?: { width: number; height: number };
}

interface GenerateImageResponse {
  url: string;
  id: string;
}

export const llmService = {
  async generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!request.prompt.trim()) {
      throw new Error('Prompt cannot be empty');
    }

    await rateLimiter.check('image-generation');

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Image generation failed');
    }

    return response.json();
  }
};
```

### Best Practices
- Use small functions (less than 30 lines) to make code more readable and maintainable
- Always show loading indicators for LLM operations
- Implement timeouts for long-running operations
- Allow users to cancel operations
- Log all LLM API calls for cost monitoring
- Implement rate limiting to control costs
- Cache responses when appropriate

## Error Handling

### Error Pattern

```typescript
// shared/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;
  if (error instanceof Error) return new AppError(error.message, 'UNKNOWN_ERROR');
  return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR');
};

// Usage in components
try {
  await userService.update(userId, updates);
} catch (error) {
  const appError = handleError(error);
  logger.error('Failed to update user', { userId, error: appError });
  toast.error(appError.message);
}
```

### Logging

```typescript
// shared/services/logger.ts
export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, meta);
    // Send to logging service (e.g., Sentry, LogRocket)
  },

  error: (message: string, meta?: Record<string, any>) => {
    console.error(`[ERROR] ${message}`, meta);
    // Send to error tracking service
  },

  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, meta);
  },
};
```

## Testing Requirements

### Test Coverage (Mandatory)

Every feature MUST include:
- **Unit Tests** - Test individual functions and utilities
- **Component Tests** - Test React components in isolation
- **Integration Tests** - Test feature workflows
- **E2E Tests** (for critical paths) - Test user journeys

### Test-Driven Development (TDD)

**Always follow Red → Green → Refactor**:
1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green

See `/develop` command for detailed TDD workflow.

## CI/CD Pipeline

The project uses GitHub Actions for Continuous Integration and Deployment, split into two workflows:

1. **CI Pipeline (`ci.yml`)**
   - Runs on: Pull Requests to `main`
   - Checks: Tests, Build, Supabase Migration/Type checks
   - Must pass before merging

2. **CD Pipeline (`cd.yml`)**
   - Runs on: Push to `main`
   - Actions: Deploys to Supabase (database migrations)

See `docs/cicd.md` for complete CI/CD configuration details.

**Required checks before merge**:
- Type checking passes
- All tests pass
- Production build succeeds
- Supabase types are up to date
- When checking the database, use supabase cli commands like `supabase db remote commit`

## Performance Optimization

**Note**: Only optimize AFTER functionality is working and tests are passing.

### React Performance
- Use `memo`, `useMemo`, `useCallback` for expensive operations
- Implement code splitting with `lazy` and `Suspense`
- Optimize images (WebP, lazy loading, multiple sizes)

### Database Performance
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Minimize database calls

## Deployment

The project includes Docker support:
```bash
docker build -t my-app .
docker run -p 3000:3000 my-app
```

Build output structure:
```
build/
├── client/    # Static assets for browser
└── server/    # Server-side rendered code
```

## Key Files & Directories

- `app/root.tsx` - Root layout and error boundary
- `app/routes.ts` - Route configuration
- `app/routes/` - Route component files
- `app/features/` - Feature-based code organization
- `app/shared/` - Shared/reusable code
- `react-router.config.ts` - React Router settings (SSR, etc.)
- `vite.config.ts` - Build tool configuration
- `docs/cicd.md` - CI/CD pipeline configuration
- `.claude/commands/develop.md` - Development workflow command

## Development Workflow

For implementing new features, use the `/develop` command which enforces:
- Pre-development checklist
- Test-driven development
- Manual browser validation
- No regressions policy

## Summary of Non-Negotiable Rules
✅ **Local development** When developing locally, always apply the change locally for supabase updates
✅ **Plan** Always generate a plan that is validated before going to changes
✅ **Screaming Architecture** - Feature-based organization
✅ **Mobile-First Design** - Always design for mobile first
✅ **Type Safety** - Strict TypeScript, NEVER USE `any` as type
✅ **Self-Documenting Code** - No method docs, clear names/types
✅ **Security** - Environment variables, input validation, RLS
✅ **Testing** - TDD approach, comprehensive coverage
✅ **Accessibility** - Semantic HTML, WCAG AA, keyboard navigation
✅ **Error Handling** - Graceful degradation, user-friendly messages
✅ **Performance After Functionality** - Optimize only after tests pass
✅ **Documentation** - When updating the project workflow or other configurations always update the claude.md file and the readme.md file
