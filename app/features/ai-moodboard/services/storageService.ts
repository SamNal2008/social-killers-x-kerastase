import { supabase } from '~/shared/services/supabase';

/**
 * Service for handling image storage operations with Supabase Storage
 * Centralizes all storage-related logic for generated images
 */
export const storageService = {
  /**
   * Uploads a base64-encoded image to Supabase Storage
   * Converts base64 to blob, uploads to public bucket, and returns public URL
   *
   * @param imageBase64 - Base64-encoded image data (with or without data URI prefix)
   * @param userResultId - User result ID for filename generation
   * @param imageIndex - Index of the image in the generation sequence
   * @returns Public URL of the uploaded image
   */
  async uploadImage(
    imageBase64: string,
    userResultId: string,
    imageIndex: number
  ): Promise<string> {
    // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to binary data
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob from binary data
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    // Generate unique filename
    const filename = `${userResultId}-${Date.now()}-${imageIndex}.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);

    console.log(`Image uploaded: ${data.publicUrl.substring(0, 60)}...`);
    return data.publicUrl;
  },

  /**
   * Gets the public URL for an existing file in storage
   *
   * @param filename - Name of the file in storage
   * @returns Public URL of the file
   */
  getPublicUrl(filename: string): string {
    const { data } = supabase.storage
      .from('generated-images')
      .getPublicUrl(filename);

    return data.publicUrl;
  },

  /**
   * Deletes an image from storage
   *
   * @param filename - Name of the file to delete
   */
  async deleteImage(filename: string): Promise<void> {
    const { error } = await supabase.storage
      .from('generated-images')
      .remove([filename]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  },
};
