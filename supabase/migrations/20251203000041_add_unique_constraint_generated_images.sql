-- Remove duplicate images (keep only the earliest one for each user_result_id + image_index combination)
DELETE FROM generated_images
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_result_id, image_index ORDER BY created_at) as row_num
    FROM generated_images
  ) subquery
  WHERE row_num > 1
);

-- Add unique constraint to prevent duplicate image indexes per user result
ALTER TABLE generated_images
ADD CONSTRAINT unique_user_result_image_index UNIQUE (user_result_id, image_index);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT unique_user_result_image_index ON generated_images IS 'Ensures each user result can only have one image per index (prevents duplicate insertions)';
