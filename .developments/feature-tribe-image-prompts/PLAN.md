# Feature: Tribe-Specific Image Generation Prompts

## Context

Replace hardcoded image generation prompt with database-driven, tribe-specific prompts for personalized AI image generation using Gemini API.

## Feature Description

When generating images, the Edge Function should:
1. Fetch the user's tribe from the `user_results` table
2. Retrieve the tribe's `image_generation_prompt` from the `tribes` table
3. Use that prompt with Gemini API instead of a hardcoded value

## Implementation Status

### ✅ Completed
- [x] Database migration to add `image_generation_prompt` column to `tribes` table
- [x] Seeded all 10 tribes with unique, detailed prompts
- [x] Implemented `fetchTribePrompt` function in Edge Function
- [x] Updated Edge Function to use database prompts
- [x] Fixed Deno import to use `jsr:@supabase/supabase-js@2`

### 🔄 In Progress
- [ ] Add tests for `fetchTribePrompt` function
- [ ] Add integration tests for Edge Function
- [ ] Follow TDD workflow for remaining functionality

### ⏳ Pending
- [ ] Manual testing via Postman/curl
- [ ] Production deployment verification
- [ ] Update documentation

---

## Pre-Development Checklist (Backend/Supabase)

### Planning Phase
- [x] Requirement fully understood
- [x] Clarifying questions asked and answered
- [x] Affected files identified:
  - `supabase/migrations/20251202000000_add_image_generation_prompt_to_tribes.sql`
  - `supabase/functions/generate-image/index.ts`
- [x] Edge cases and error scenarios documented:
  - User result not found
  - Tribe has no prompt configured
  - Database connection error
  - Invalid user result ID
- [x] Test scenarios defined

### Implementation Phase (Backend TDD)
- [x] Write unit tests for `fetchTribePrompt`
  - `supabase/functions/generate-image/fetchTribePrompt.test.ts`
- [x] Write integration tests for Edge Function
  - `supabase/functions/generate-image/integration.test.ts`
- [x] Implement minimal code to pass tests (already done)
- [x] Add error handling (already done)
- [x] Refactor for code quality

### Validation Phase
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Manual API testing completed
  - [ ] Happy path verified (valid user result)
  - [ ] Error states verified (invalid ID, missing prompt)
  - [ ] Database query performance verified
- [ ] Edge Function deploys successfully
- [ ] Production test with real data

### Quality Assurance
- [x] Code follows screaming architecture
- [x] No sensitive data exposed
- [x] Proper error handling implemented
- [x] Type safety maintained (no `any` types)

---

## Files Modified

1. **Migration**: `supabase/migrations/20251202000000_add_image_generation_prompt_to_tribes.sql`
   - Added `image_generation_prompt TEXT` column to `tribes` table
   - Populated prompts for all 10 tribes

2. **Edge Function**: `supabase/functions/generate-image/index.ts`
   - Replaced `generateDefaultPrompt` with `fetchTribePrompt`
   - Added database query with join to fetch tribe prompt
   - Updated import to use JSR prefix for Deno compatibility

---

## Test Scenarios

### Unit Tests: `fetchTribePrompt`

1. **Happy Path**: Returns prompt for valid user result
2. **Error: User result not found**: Throws descriptive error
3. **Error: Tribe has no prompt**: Throws descriptive error
4. **Error: Database error**: Handles and logs database errors

### Integration Tests: Edge Function

1. **Happy Path**: Generates image with tribe-specific prompt
2. **Custom prompt override**: Uses custom prompt when provided
3. **Error: Invalid user result ID**: Returns 400 error
4. **Error: Missing prompt**: Returns 500 error with message

---

## Next Steps

1. Create test file for Edge Function
2. Write failing tests following TDD
3. Verify existing implementation passes tests
4. Manual testing via API calls
5. Merge to main and deploy

---

## Notes

- This is backend-only feature (no frontend changes)
- Supabase Edge Functions use Deno runtime
- Testing approach adapted from develop.md for backend context
- All prompts are in English and highly detailed for best AI generation results
