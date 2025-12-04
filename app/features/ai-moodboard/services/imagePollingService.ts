import { supabase } from '~/shared/services/supabase';
import type { GeneratedImage } from '../types';

interface PollImagesResult {
  images: GeneratedImage[];
  isComplete: boolean;
}

const EXPECTED_IMAGE_COUNT = 3;

export const imagePollingService = {
  async deleteGeneratedImages(userResultId: string): Promise<void> {
    if (!userResultId || userResultId.trim() === '') {
      throw new Error('userResultId cannot be empty');
    }

    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('user_result_id', userResultId);

    if (error) {
      throw new Error(`Failed to delete generated images: ${error.message}`);
    }
  },

  async pollGeneratedImages(userResultId: string): Promise<PollImagesResult> {
    if (!userResultId || userResultId.trim() === '') {
      throw new Error('userResultId cannot be empty');
    }

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_result_id', userResultId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch generated images: ${error.message}`);
    }

    const images: GeneratedImage[] = (data || []).map((dbImage) => ({
      id: dbImage.id,
      url: dbImage.image_url,
      prompt: dbImage.prompt,
      timestamp: dbImage.created_at
        ? new Date(dbImage.created_at).getTime()
        : Date.now(),
    }));

    return {
      images,
      isComplete: images.length >= EXPECTED_IMAGE_COUNT,
    };
  },
};
