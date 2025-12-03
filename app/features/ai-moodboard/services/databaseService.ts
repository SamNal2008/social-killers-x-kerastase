import { supabase } from '~/shared/services/supabase';
import type { GeneratedImage } from '../types';

/**
 * Database record shape from generated_images table
 */
interface GeneratedImageRecord {
  id: string;
  user_result_id: string;
  image_url: string;
  prompt: string;
  image_index: number;
  is_primary: boolean;
  created_at: string;
}

/**
 * Transforms a database record into a GeneratedImage
 */
const transformToGeneratedImage = (
  record: GeneratedImageRecord,
  timestamp: number
): GeneratedImage => ({
  id: record.id,
  url: record.image_url,
  prompt: record.prompt,
  imageIndex: record.image_index,
  timestamp,
});

/**
 * Service for handling database operations related to generated images
 * Centralizes all database queries and mutations
 */
export const databaseService = {
  /**
   * Saves a generated image to the database
   * Upserts to handle retries on the same image index
   *
   * @param userResultId - User result ID
   * @param imageUrl - Public URL of the generated image
   * @param prompt - Prompt used to generate the image
   * @param imageIndex - Index of the image in the generation sequence
   */
  async saveGeneratedImage(
    userResultId: string,
    imageUrl: string,
    prompt: string,
    imageIndex: number
  ): Promise<void> {
    const imageToInsert = {
      user_result_id: userResultId,
      image_url: imageUrl,
      prompt,
      image_index: imageIndex,
      is_primary: imageIndex === 0,
    };

    const { error: insertError } = await supabase
      .from('generated_images')
      .upsert(imageToInsert, {
        onConflict: 'user_result_id,image_index',
        ignoreDuplicates: false,
      });

    if (insertError) {
      throw new Error(`Failed to save image to database: ${insertError.message}`);
    }

    console.log(`Image ${imageIndex} saved to database`);

    // If this is the first image, update user_results table
    if (imageIndex === 0) {
      const { error: updateError } = await supabase
        .from('user_results')
        .update({ generated_image_url: imageUrl })
        .eq('id', userResultId);

      if (updateError) {
        console.error('Error updating user_results with first image:', updateError);
        // Don't throw - this is not critical
      }
    }
  },

  /**
   * Fetches all existing generated images for a user result
   *
   * @param userResultId - User result ID
   * @returns Array of generated images, sorted by image index
   */
  async fetchExistingImages(userResultId: string): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_result_id', userResultId)
      .order('image_index', { ascending: true });

    if (error) {
      console.error('Error fetching existing images:', error);
      return [];
    }

    const timestamp = Date.now();
    return (data as GeneratedImageRecord[]).map((record) =>
      transformToGeneratedImage(record, timestamp)
    );
  },

  /**
   * Deletes all generated images for a user result
   *
   * @param userResultId - User result ID
   */
  async deleteAllImages(userResultId: string): Promise<void> {
    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('user_result_id', userResultId);

    if (error) {
      throw new Error(`Failed to delete images: ${error.message}`);
    }
  },

  /**
   * Gets a single generated image by user result ID and image index
   *
   * @param userResultId - User result ID
   * @param imageIndex - Image index
   * @returns Generated image or null if not found
   */
  async getImage(
    userResultId: string,
    imageIndex: number
  ): Promise<GeneratedImage | null> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_result_id', userResultId)
      .eq('image_index', imageIndex)
      .single();

    if (error) {
      console.error('Error fetching image:', error);
      return null;
    }

    const timestamp = Date.now();
    return transformToGeneratedImage(data as GeneratedImageRecord, timestamp);
  },
};
