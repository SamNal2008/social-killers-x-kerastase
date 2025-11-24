# GitHub Secrets Configuration for CI/CD Pipeline

## Overview
This document outlines the required GitHub secrets for the CI/CD pipeline to deploy to Supabase and Netlify. No secrets are hardcoded in the workflow files - all sensitive data is stored as GitHub repository secrets.

## Required GitHub Secrets

### Supabase Secrets
1. **SUPABASE_ACCESS_TOKEN**
   - Description: Access token for Supabase CLI authentication
   - How to obtain:
     - Go to https://supabase.com/dashboard/account/tokens
     - Generate a new access token
     - Copy the token value
   - GitHub setup:
     - Navigate to repository Settings → Secrets and variables → Actions
     - Click "New repository secret"
     - Name: `SUPABASE_ACCESS_TOKEN`
     - Value: Paste your Supabase access token

2. **SUPABASE_PROJECT_ID**
   - Description: Your Supabase project identifier
   - How to obtain:
     - Go to your Supabase project dashboard
     - The project ID is in the URL: `https://app.supabase.com/project/PROJECT_ID`
     - Or find it in Project Settings → API → Project ID
   - GitHub setup:
     - Add as repository secret named `SUPABASE_PROJECT_ID`

### Netlify Secrets
1. **NETLIFY_AUTH_TOKEN**
   - Description: Personal access token for Netlify API
   - How to obtain:
     - Go to https://app.netlify.com/user/applications
     - Click "Personal access tokens"
     - Generate a new token
     - Copy the token value
   - GitHub setup:
     - Add as repository secret named `NETLIFY_AUTH_TOKEN`

2. **NETLIFY_SITE_ID**
   - Description: Unique identifier for your Netlify site
   - How to obtain:
     - Go to your Netlify site dashboard
     - Navigate to Site settings → General → Site details
     - Copy the Site ID
     - Or find it in the site URL: `https://app.netlify.com/sites/SITE_ID`
   - GitHub setup:
     - Add as repository secret named `NETLIFY_SITE_ID`

## Setup Steps

### 1. Navigate to GitHub Repository Secrets
1. Go to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"

### 2. Add Each Secret
For each secret listed above:
1. Click "New repository secret"
2. Enter the exact name (case-sensitive)
3. Paste the corresponding value
4. Click "Add secret"

### 3. Verify Setup
1. Go to "Actions" tab in your repository
2. Check that all secrets are properly configured
3. Test the pipeline by pushing to your main branch

## Security Notes
- **Never commit secrets to your repository**
- **Use strong, unique tokens** for each service
- **Rotate tokens regularly** for security
- **Limit token permissions** to only what's necessary
- **Review access logs** periodically on Supabase and Netlify

## Environment Protection
The pipeline uses GitHub environments for production deployments:
- **Production environment**: Configured for main branch deployments
- Consider adding **environment protection rules**:
  - Require reviewers for production deployments
  - Wait period before deployment
  - Deployment restrictions

## Troubleshooting
- If deployments fail, check:
  - Secret names match exactly (including case)
  - Tokens have proper permissions
  - Project/site IDs are correct
  - Environment protection rules aren't blocking deployment

## Additional Optional Secrets
For enhanced functionality, consider adding:
- **CODECOV_TOKEN**: For code coverage reporting
- **SLACK_WEBHOOK**: For deployment notifications
- **SENTRY_DSN**: For error tracking in production
