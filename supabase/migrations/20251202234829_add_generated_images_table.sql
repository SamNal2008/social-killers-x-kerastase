-- Create table to store all generated images for each user result
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_result_id UUID NOT NULL REFERENCES user_results(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_index INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add index on user_result_id for faster lookups
CREATE INDEX idx_generated_images_user_result_id ON generated_images(user_result_id);

-- Add index on is_primary to quickly find primary images
CREATE INDEX idx_generated_images_is_primary ON generated_images(user_result_id, is_primary) WHERE is_primary = true;

-- Add comment to table
COMMENT ON TABLE generated_images IS 'Stores all AI-generated images for user results';
COMMENT ON COLUMN generated_images.user_result_id IS 'Reference to the user result this image belongs to';
COMMENT ON COLUMN generated_images.image_url IS 'Public URL of the generated image';
COMMENT ON COLUMN generated_images.prompt IS 'Prompt used to generate this image';
COMMENT ON COLUMN generated_images.image_index IS 'Index/order of the image in the generation batch (0-based)';
COMMENT ON COLUMN generated_images.is_primary IS 'Whether this is the primary/featured image for the user result';
