import { supabase } from '~/shared/services/supabase';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = 'moodboard_pictures';

export interface SubcultureWithMoodboard {
  id: string;
  name: string;
  moodboardId: string | null;
  currentImageUrl: string | null;
}

export interface UploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

interface SubcultureQueryResult {
  id: string;
  name: string;
  moodboards: Array<{ id: string; image_url: string | null }>;
}

export const moodboardUploadService = {
  async fetchSubculturesWithMoodboards(): Promise<SubcultureWithMoodboard[]> {
    const { data, error } = await supabase
      .from('subcultures')
      .select(`
        id,
        name,
        moodboards (
          id,
          image_url
        )
      `);

    if (error) {
      throw new Error(`Failed to fetch subcultures: ${error.message}`);
    }

    return (data as SubcultureQueryResult[] || []).map((subculture) => {
      const moodboard = subculture.moodboards?.[0];
      return {
        id: subculture.id,
        name: subculture.name,
        moodboardId: moodboard?.id || null,
        currentImageUrl: moodboard?.image_url || null,
      };
    });
  },

  async uploadMoodboardImage(file: File, subcultureId: string): Promise<UploadResult> {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'File size exceeds 10MB limit.',
      };
    }

    const timestamp = Date.now();
    const filePath = `${subcultureId}/${timestamp}_${file.name}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      imageUrl: urlData.publicUrl,
    };
  },

  async updateMoodboardImageUrl(moodboardId: string, imageUrl: string): Promise<void> {
    const { error } = await supabase
      .from('moodboards')
      .update({ image_url: imageUrl })
      .eq('id', moodboardId);

    if (error) {
      throw new Error(`Failed to update moodboard image URL: ${error.message}`);
    }
  },

  async createMoodboardForSubculture(subcultureId: string): Promise<string> {
    const { data, error } = await supabase
      .from('moodboards')
      .insert({ subculture_id: subcultureId })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create moodboard: ${error.message}`);
    }

    return data.id;
  },
};
