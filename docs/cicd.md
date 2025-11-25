# CI/CD Pipeline Configuration

## Overview

This document outlines the Continuous Integration and Continuous Deployment pipeline configuration for the React Router v7 + Supabase application.

## Git Workflow

1. **Feature Branches**: Developers work on feature branches (`feature/*`, `fix/*`, `chore/*`).
2. **Pull Request**: Open a PR to `main` when ready.
3. **CI Checks**: GitHub Actions run the CI pipeline.
4. **Merge**: Upon approval and passing checks, merge to `main`.
5. **Deployment**: Merging to `main` triggers the CD pipeline.

## GitHub Actions Configuration

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Trigger**: Pull Requests to `main`.

**Jobs**:
- **test**:
  - Checkouts code.
  - Sets up Node.js (v20).
  - Installs dependencies (`npm ci`).
  - Runs Type Checking (`npm run typecheck`).
  - Runs Tests (`npm run test:coverage`).
  - Uploads coverage to Codecov.
- **build**:
  - Builds the application (`npm run build`).
  - Uploads build artifacts.
- **test-supabase-migration**:
  - Sets up Supabase CLI.
  - Starts local Supabase.
  - Generates types and ensures they match the committed code.

### 2. CD Pipeline (`.github/workflows/cd.yml`)

**Trigger**: Push to `main`.

**Jobs**:
- **test**, **build**, **test-supabase-migration**: Re-runs all CI checks to ensure integrity.
- **deploy-supabase**:
  - Depends on: `test`, `build`, `test-supabase-migration`.
  - Sets up Supabase CLI.
  - Links to the remote Supabase project.
  - Pushes database changes: `supabase db push`.

## Required GitHub Secrets

Configure these in GitHub Settings → Secrets and Variables → Actions:

- `SUPABASE_ACCESS_TOKEN`: Personal Access Token for Supabase CLI (starts with `sbp_`).
- `SUPABASE_DB_PASSWORD`: Password for the remote Supabase database.
- `SUPABASE_PROJECT_ID`: Reference ID of the Supabase project.
