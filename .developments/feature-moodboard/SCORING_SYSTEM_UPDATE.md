# Scoring System Update - Compute User Result

## Overview
Updated the `compute-user-result` Supabase Edge Function to implement a new point-based scoring system for determining user tribe affiliations.

## New Scoring Logic

### Point Distribution
1. **Moodboard Selection** → +2 points to ALL tribes in the selected subculture
2. **Keyword Selection** → +1 point to the tribe affiliated with each selected keyword
3. **Brand Selection** → +1 point to the tribe affiliated with each selected brand

### Calculation Flow
1. Fetch all tribes belonging to the selected subculture (via moodboard)
2. Add 2 points to each tribe in that subculture
3. For each selected keyword, add 1 point to its affiliated tribe
4. For each selected brand, add 1 point to its affiliated tribe
5. Calculate percentage for each tribe: `(tribe_points / total_points) * 100`
6. Determine dominant tribe as the one with the highest score

## Files Modified

### `/supabase/functions/compute-user-result/index.ts`
**Changes:**
- Renamed `TribeCount` → `TribeScore` with `points` instead of `count`
- Added `SubcultureTribe` interface for tribe-subculture relationships
- Created `fetchTribesInSubculture()` to get all tribes in a subculture
- Replaced `countTribes()` with `calculateTribeScores()` implementing new logic
- Updated `findDominantTribe()` to use points instead of counts
- Renamed `calculateTotalSelections()` → `calculateTotalPoints()`
- Updated all percentage calculations to use points

**New Functions:**
```typescript
fetchTribesInSubculture(supabase, subcultureId): Promise<SubcultureTribe[]>
calculateTribeScores(subcultureTribes, keywordTribes, brandTribes): TribeScores
```

### `/supabase/migrations/20251201000000_seed_tribe_subcultures.sql`
**Created:** New migration to populate the `tribe_subcultures` junction table with relationships:
- LEGACISTS: Heritage Heiress, Quiet Luxury, Femme Fatale (3 tribes)
- FUNCTIONALS: Clean Ritualist, Longevity Ritualist, Conscious Hedonist (3 tribes)
- ROMANTICS: Sensorialist, Sillage Seeker, Literary, Emotional Creator, Sisterhood Keeper (5 tribes)
- CURATORS: Culture Guru, Urban Muse Energizer, Stagebreaker (3 tribes)
- MYSTICS: Soul Healer, Cosmic Explorer, Sacred Feminine (3 tribes)
- UNAPOLOGETICS: Misfit, Early Adopter, Edgy Aesthete, Status Siren (4 tribes)

## Example Calculation

**User Selections:**
- Moodboard: ROMANTICS subculture
- Keywords: 2 keywords (1 from Sensorialist, 1 from Literary)
- Brands: 1 brand (from Sillage Seeker)

**Point Distribution:**
- Sensorialist: 2 (moodboard) + 1 (keyword) = 3 points
- Sillage Seeker: 2 (moodboard) + 1 (brand) = 3 points
- Literary: 2 (moodboard) + 1 (keyword) = 3 points
- Emotional Creator: 2 (moodboard) = 2 points
- Sisterhood Keeper: 2 (moodboard) = 2 points
- **Total: 13 points**

**Percentages:**
- Sensorialist: 23.08%
- Sillage Seeker: 23.08%
- Literary: 23.08%
- Emotional Creator: 15.38%
- Sisterhood Keeper: 15.38%

**Dominant Tribe:** Sensorialist (or Sillage Seeker or Literary - first with max points)

## Database Schema Dependencies

Requires:
- `tribe_subcultures` table (created in migration `20251127235301`)
- `tribes` table with proper relationships
- `keywords.tribe_id` and `brands.tribe_id` foreign keys

## Testing Requirements

Before deploying, ensure:
1. Run migration: `supabase migration up`
2. Verify `tribe_subcultures` table is populated (21 total relationships)
3. Test edge function with sample data
4. Verify percentages sum correctly
5. Confirm dominant tribe selection logic

## API Response Format

No changes to the response structure - still returns:
```typescript
{
  success: true,
  data: {
    userResultId: string,
    subcultureId: string,
    subcultureName: string,
    dominantTribeId: string,
    dominantTribeName: string,
    tribes: Array<{
      tribeId: string,
      tribeName: string,
      percentage: number
    }>
  }
}
```

## Status
✅ Implementation complete
⏳ Requires migration deployment
⏳ Requires testing with real data
