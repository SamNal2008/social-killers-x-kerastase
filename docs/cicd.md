# CI/CD Pipeline Configuration

## Overview

This document outlines the Continuous Integration and Continuous Deployment pipeline configuration for the React Router v7 + Supabase application.

## Pipeline Goals

1. **Prevent Regressions** - Catch breaking changes before they reach production
2. **Ensure Code Quality** - Enforce standards through automated checks
3. **Security** - Scan for vulnerabilities and secrets
4. **Fast Feedback** - Provide quick results to developers
5. **Reliable Deployments** - Consistent, repeatable deployment process

---

## GitHub Actions Configuration

### Main CI Pipeline

**File**: `.github/workflows/ci.yml`

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  # Job 1: Quality Checks
  quality:
    name: Code Quality
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run TypeScript type checking
        run: npm run typecheck

      - name: Run linter (if configured)
        run: npm run lint
        continue-on-error: false

  # Job 2: Unit & Component Tests
  test-unit:
    name: Unit & Component Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage --run

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

      - name: Check coverage thresholds
        run: |
          echo "Checking coverage thresholds..."
          # Add custom threshold checks if needed

  # Job 3: E2E Tests
  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  # Job 4: Build Verification
  build:
    name: Production Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          NODE_ENV: production

      - name: Check build output
        run: |
          if [ ! -d "build/client" ] || [ ! -d "build/server" ]; then
            echo "Build output incomplete"
            exit 1
          fi

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: build/
          retention-days: 7

  # Job 5: Security Checks
  security:
    name: Security Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}
          head: HEAD

  # Job 6: All Checks Complete
  all-checks:
    name: All Checks Passed
    runs-on: ubuntu-latest
    needs: [quality, test-unit, test-e2e, build, security]

    steps:
      - name: All checks passed
        run: echo "✅ All CI checks passed successfully!"
```

---

## Deployment Pipeline

### Production Deployment

**File**: `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  # Run full CI pipeline first
  ci:
    uses: ./.github/workflows/ci.yml

  # Deploy only if CI passes
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [ci]
    environment:
      name: production
      url: https://your-production-url.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build
        env:
          NODE_ENV: production
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to hosting provider
        run: |
          # Example for various hosting providers:

          # For Vercel:
          # npm install -g vercel
          # vercel --prod --token=${{ secrets.VERCEL_TOKEN }}

          # For Netlify:
          # npm install -g netlify-cli
          # netlify deploy --prod --auth=${{ secrets.NETLIFY_TOKEN }}

          # For Docker/Cloud Run:
          # docker build -t your-app .
          # docker push gcr.io/project/your-app
          # gcloud run deploy your-app --image gcr.io/project/your-app

      - name: Notify deployment success
        if: success()
        run: echo "✅ Deployment successful!"

      - name: Notify deployment failure
        if: failure()
        run: echo "❌ Deployment failed!"
```

### Staging Deployment

**File**: `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  ci:
    uses: ./.github/workflows/ci.yml

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [ci]
    environment:
      name: staging
      url: https://staging.your-url.com

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build
        env:
          NODE_ENV: production
          VITE_SUPABASE_URL: ${{ secrets.STAGING_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.STAGING_SUPABASE_ANON_KEY }}

      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."
```

---

## Required GitHub Secrets

Configure these in GitHub Settings → Secrets and Variables → Actions:

### Production Secrets
- `VITE_SUPABASE_URL` - Production Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Production Supabase anonymous key
- `VERCEL_TOKEN` / `NETLIFY_TOKEN` - Hosting provider token (if applicable)

### Staging Secrets
- `STAGING_SUPABASE_URL` - Staging Supabase project URL
- `STAGING_SUPABASE_ANON_KEY` - Staging Supabase anonymous key

### Optional Secrets
- `CODECOV_TOKEN` - For code coverage reporting
- `SLACK_WEBHOOK_URL` - For deployment notifications
- `SENTRY_DSN` - For error tracking

---

## Branch Protection Rules

Configure in GitHub Settings → Branches:

### Main Branch
- ✅ Require pull request reviews before merging (1+ approvals)
- ✅ Require status checks to pass before merging:
  - `Code Quality`
  - `Unit & Component Tests`
  - `E2E Tests`
  - `Production Build`
  - `Security Scan`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings

### Develop Branch
- ✅ Require status checks to pass before merging:
  - `Code Quality`
  - `Unit & Component Tests`
  - `Production Build`

---

## Pre-Commit Hooks (Optional)

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run type checking
npm run typecheck || exit 1

# Run tests (fast mode)
npm test -- --run || exit 1

echo "✅ Pre-commit checks passed!"
```

**Setup**:
```bash
npm install -D husky
npx husky install
npx husky add .husky/pre-commit "npm run typecheck && npm test -- --run"
```

---

## Test Coverage Thresholds

**File**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      },
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        'build/',
        '.react-router/'
      ]
    }
  }
});
```

---

## Performance Budgets

**File**: `.github/workflows/performance.yml`

```yaml
name: Performance Check

on:
  pull_request:
    branches: [main]

jobs:
  performance:
    name: Bundle Size Check
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          CLIENT_SIZE=$(du -sb build/client | cut -f1)
          MAX_SIZE=$((5 * 1024 * 1024))  # 5MB limit

          if [ "$CLIENT_SIZE" -gt "$MAX_SIZE" ]; then
            echo "❌ Client bundle size exceeds 5MB"
            exit 1
          else
            echo "✅ Client bundle size within limits"
          fi
```

---

## Monitoring & Alerts

### Post-Deployment Health Checks

```yaml
# Add to deployment workflow
- name: Health check
  run: |
    sleep 10  # Wait for deployment to stabilize

    response=$(curl -s -o /dev/null -w "%{http_code}" https://your-production-url.com)

    if [ "$response" != "200" ]; then
      echo "❌ Health check failed with status $response"
      exit 1
    fi

    echo "✅ Health check passed"
```

### Error Rate Monitoring

Integrate with services like:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **DataDog** - Application monitoring
- **New Relic** - Performance monitoring

---

## Rollback Strategy

### Automatic Rollback

```yaml
- name: Deploy with rollback
  run: |
    # Deploy new version
    vercel --prod

    # Wait and check health
    sleep 30

    # Check error rate
    ERROR_RATE=$(curl -s https://api.monitoring-service.com/error-rate)

    if [ "$ERROR_RATE" -gt "5" ]; then
      echo "❌ High error rate detected, rolling back..."
      vercel rollback
      exit 1
    fi
```

### Manual Rollback

```bash
# Using Vercel
vercel rollback

# Using Netlify
netlify rollback

# Using Docker
kubectl rollout undo deployment/your-app
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All CI checks pass
- [ ] Code review completed and approved
- [ ] Feature tested in staging environment
- [ ] Database migrations applied (if applicable)
- [ ] Environment variables configured
- [ ] Rollback plan documented
- [ ] Stakeholders notified
- [ ] Monitoring configured
- [ ] Post-deployment testing plan ready

---

## Troubleshooting

### Common CI Failures

**Type Check Failure**
```bash
# Run locally to debug
npm run typecheck

# Check for any new dependencies that need types
npm install -D @types/package-name
```

**Test Failure**
```bash
# Run tests locally
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run with coverage
npm test -- --coverage
```

**Build Failure**
```bash
# Build locally
npm run build

# Check for environment variable issues
# Ensure all VITE_ prefixed vars are set
```

**E2E Failure**
```bash
# Run E2E tests locally
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Debug specific test
npm run test:e2e -- --debug path/to/test.spec.ts
```

---

## Best Practices

1. **Keep CI Fast** - Optimize test execution time, use caching
2. **Fail Fast** - Run quick checks first (type checking, linting)
3. **Parallel Execution** - Run independent jobs concurrently
4. **Clear Feedback** - Provide actionable error messages
5. **Consistent Environments** - Use same Node version across all environments
6. **Secure Secrets** - Never commit secrets, use GitHub Secrets
7. **Monitor Performance** - Track CI execution time and optimize
8. **Regular Updates** - Keep actions and dependencies up to date

---

## Summary

✅ **Automated Quality Checks** - Type checking, linting, tests
✅ **Comprehensive Testing** - Unit, component, integration, E2E
✅ **Security Scanning** - Dependency audits, secret detection
✅ **Build Verification** - Production builds tested
✅ **Deployment Automation** - Consistent, repeatable deployments
✅ **Rollback Strategy** - Quick recovery from issues
✅ **Monitoring** - Health checks, error tracking
✅ **Branch Protection** - Enforce checks before merge

**Remember**: The CI/CD pipeline is your safety net. Trust it, but also keep improving it.