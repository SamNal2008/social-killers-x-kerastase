-- Migration: Add image_url to moodboards table
-- Description: Adds image_url column to support moodboard card images
-- Author: Generated via Antigravity
-- Date: 2025-12-01

-- ============================================================================
-- Add image_url column to moodboards table
-- ============================================================================

ALTER TABLE moodboards
  ADD COLUMN image_url TEXT;

CREATE INDEX idx_moodboards_image_url ON moodboards(image_url);

COMMENT ON COLUMN moodboards.image_url IS 'URL to the moodboard image displayed on the card';
