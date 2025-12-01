-- Migration: Add subtitle and guidelines (dos/donts) to subcultures
-- Description: Extends subcultures table with textual subtitle and JSONB arrays
--               to store do and don't guidelines for each subculture.

ALTER TABLE subcultures
  ADD COLUMN subtitle TEXT,
  ADD COLUMN dos JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN donts JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN subcultures.subtitle IS 'Short tagline for the subculture used in detail screens';
COMMENT ON COLUMN subcultures.dos IS 'Array of DO guidelines for this subculture';
COMMENT ON COLUMN subcultures.donts IS 'Array of DONT guidelines for this subculture';

