-- Migration: Add Generated Image Storage
-- Description: Adds storage bucket for generated images and updates user_results table
-- Author: Generated via Claude Code
-- Date: 2024-12-01

-- ============================================================================
-- ADD GENERATED IMAGE URL TO USER RESULTS
-- ============================================================================

-- Add generated_image_url column to user_results table
ALTER TABLE user_results 
ADD COLUMN generated_image_url TEXT;

-- Add index for faster queries on generated images
CREATE INDEX idx_user_results_generated_image_url 
ON user_results(generated_image_url) 
WHERE generated_image_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_results.generated_image_url IS 'URL of the AI-generated personalized image stored in Supabase Storage';

-- ============================================================================
-- CREATE STORAGE BUCKET FOR GENERATED IMAGES
-- ============================================================================

-- Create storage bucket for generated images (public access for viewing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR STORAGE
-- ============================================================================

-- Allow public read access to generated images
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
USING (bucket_id = 'generated-images');

-- Allow authenticated users to upload generated images
-- In production, this should be restricted to service role only
CREATE POLICY "Service role can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated-images' 
  AND (auth.role() = 'service_role' OR auth.role() = 'authenticated')
);

-- Allow service role to delete generated images (for cleanup)
CREATE POLICY "Service role can delete generated images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'generated-images' 
  AND auth.role() = 'service_role'
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- Note: storage.buckets is a system table, comments managed by Supabase
