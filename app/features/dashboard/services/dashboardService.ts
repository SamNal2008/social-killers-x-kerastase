import { supabase } from '~/shared/services/supabase';
import type { DashboardUserResult } from '../types';

interface DatabaseUserResult {
  id: string;
  user_id: string;
  tribe_id: string;
  generated_image_url: string | null;
  created_at: string;
  users: { name: string } | null;
  tribes: {
    tribe_subcultures: Array<{
      subcultures: { name: string } | null;
    }>;
  } | null;
  generated_images: Array<{ image_url: string; image_index: number }>;
}

export const dashboardService = {
  async getUserResults(): Promise<DashboardUserResult[]> {
    const { data, error } = await supabase
      .from('user_results')
      .select(`
        id,
        user_id,
        tribe_id,
        generated_image_url,
        created_at,
        users(name),
        tribes(
          tribe_subcultures(
            subcultures(name)
          )
        ),
        generated_images(image_url, image_index)
      `)
      .not('generated_image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch dashboard user results: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return (data as DatabaseUserResult[]).map((result) => {
      // Sort images by index and extract URLs
      const imageUrls = (result.generated_images || [])
        .sort((a, b) => a.image_index - b.image_index)
        .map((img) => img.image_url);

      // Fallback to generated_image_url if no images in generated_images table
      const finalImageUrls = imageUrls.length > 0
        ? imageUrls
        : result.generated_image_url
          ? [result.generated_image_url]
          : [];

      // Extract subculture name from the nested structure
      const subcultureName =
        result.tribes?.tribe_subcultures?.[0]?.subcultures?.name || 'Unknown Subculture';

      return {
        id: result.id,
        userId: result.user_id,
        userName: result.users?.name || 'Unknown',
        tribeId: result.tribe_id,
        subcultureName,
        generatedImageUrl: result.generated_image_url,
        imageUrls: finalImageUrls,
        createdAt: result.created_at,
      };
    });
  },
};
