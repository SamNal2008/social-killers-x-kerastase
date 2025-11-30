-- Migration: Update Schema for Simplified User Result Computation
-- Description: Updates the data model to support the new computation logic:
--   - Moodboards have 1:1 relationship with subcultures
--   - Keywords and brands link to tribes (not subcultures)
--   - Tribes have many-to-many relationship with subcultures
--   - User results store tribe percentages (not subculture percentages)
-- Author: Generated via Claude Code
-- Date: 2025-11-27

-- ============================================================================
-- STEP 1: Create tribe_subcultures junction table (many-to-many)
-- ============================================================================

CREATE TABLE tribe_subcultures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tribe_id UUID NOT NULL REFERENCES tribes(id) ON DELETE CASCADE,
  subculture_id UUID NOT NULL REFERENCES subcultures(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tribe_id, subculture_id)
);

CREATE INDEX idx_tribe_subcultures_tribe_id ON tribe_subcultures(tribe_id);
CREATE INDEX idx_tribe_subcultures_subculture_id ON tribe_subcultures(subculture_id);

COMMENT ON TABLE tribe_subcultures IS 'Many-to-many relationship between tribes and subcultures';

-- ============================================================================
-- STEP 2: Update moodboards table to link directly to subcultures
-- ============================================================================

ALTER TABLE moodboards
  ADD COLUMN subculture_id UUID REFERENCES subcultures(id) ON DELETE RESTRICT;

CREATE INDEX idx_moodboards_subculture_id ON moodboards(subculture_id);

COMMENT ON COLUMN moodboards.subculture_id IS 'Direct 1:1 relationship: each moodboard defines one subculture';

-- ============================================================================
-- STEP 3: Update keywords table to link to tribes instead of subcultures
-- ============================================================================

-- Add new tribe_id column
ALTER TABLE keywords
  ADD COLUMN tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE;

-- Remove old subculture_id foreign key constraint
ALTER TABLE keywords
  DROP CONSTRAINT keywords_subculture_id_fkey;

-- Drop old unique constraint
ALTER TABLE keywords
  DROP CONSTRAINT keywords_name_subculture_id_key;

-- Remove old subculture_id column
ALTER TABLE keywords
  DROP COLUMN subculture_id;

-- Add new unique constraint
ALTER TABLE keywords
  ADD CONSTRAINT keywords_name_tribe_id_key UNIQUE(name, tribe_id);

-- Drop old index and create new one
DROP INDEX IF EXISTS idx_keywords_subculture_id;
CREATE INDEX idx_keywords_tribe_id ON keywords(tribe_id);

COMMENT ON COLUMN keywords.tribe_id IS 'Each keyword is associated with one tribe';

-- ============================================================================
-- STEP 4: Update brands table to link to tribes
-- ============================================================================

ALTER TABLE brands
  ADD COLUMN tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE;

CREATE INDEX idx_brands_tribe_id ON brands(tribe_id);

COMMENT ON COLUMN brands.tribe_id IS 'Each brand is associated with one tribe';

-- ============================================================================
-- STEP 5: Update user_result_subcultures to store tribe percentages
-- ============================================================================

-- Rename table to better reflect it now stores tribe percentages
ALTER TABLE user_result_subcultures
  RENAME TO user_result_tribes;

-- Add tribe_id column
ALTER TABLE user_result_tribes
  ADD COLUMN tribe_id UUID REFERENCES tribes(id) ON DELETE CASCADE;

-- Drop old subculture_id constraint
ALTER TABLE user_result_tribes
  DROP CONSTRAINT user_result_subcultures_subculture_id_fkey;

-- Drop old unique constraint
ALTER TABLE user_result_tribes
  DROP CONSTRAINT user_result_subcultures_user_result_id_subculture_id_key;

-- Remove old subculture_id column
ALTER TABLE user_result_tribes
  DROP COLUMN subculture_id;

-- Add new unique constraint
ALTER TABLE user_result_tribes
  ADD CONSTRAINT user_result_tribes_user_result_id_tribe_id_key UNIQUE(user_result_id, tribe_id);

-- Drop old indexes and create new ones
DROP INDEX IF EXISTS idx_user_result_subcultures_user_result_id;
DROP INDEX IF EXISTS idx_user_result_subcultures_subculture_id;
DROP INDEX IF EXISTS idx_user_result_subcultures_percentage;

CREATE INDEX idx_user_result_tribes_user_result_id ON user_result_tribes(user_result_id);
CREATE INDEX idx_user_result_tribes_tribe_id ON user_result_tribes(tribe_id);
CREATE INDEX idx_user_result_tribes_percentage ON user_result_tribes(percentage);

COMMENT ON TABLE user_result_tribes IS 'Stores percentage distribution of tribes for each user result';
COMMENT ON COLUMN user_result_tribes.tribe_id IS 'The tribe being scored';
COMMENT ON COLUMN user_result_tribes.percentage IS 'Calculated percentage for this tribe (does not need to sum to 100%)';

-- ============================================================================
-- STEP 6: Update comments for clarity
-- ============================================================================

COMMENT ON COLUMN user_results.tribe_id IS 'The dominant tribe (tribe with highest percentage or most selections)';
