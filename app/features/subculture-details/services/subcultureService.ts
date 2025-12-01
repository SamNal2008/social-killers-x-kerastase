import { supabase } from '~/shared/services/supabase';
import type { SubcultureDetails } from '../types';

export const subcultureService = {
  async fetchSubcultureByUserResultId(userResultId: string): Promise<SubcultureDetails> {
    const { data: userResult, error: userResultError } = await supabase
      .from('user_results')
      .select('id, tribe_id')
      .eq('id', userResultId)
      .single();

    if (userResultError || !userResult) {
      throw new Error(`Failed to fetch user result: ${userResultError?.message || 'Not found'}`);
    }

    const { data: tribeSubculture, error: tribeSubcultureError } = await supabase
      .from('tribe_subcultures')
      .select(`
        subculture_id,
        subculture:subcultures (
          id,
          name,
          description
        )
      `)
      .eq('tribe_id', userResult.tribe_id)
      .single();

    if (tribeSubcultureError || !tribeSubculture) {
      throw new Error(`Failed to fetch subculture for tribe: ${tribeSubcultureError?.message || 'Not found'}`);
    }

    const subculture = tribeSubculture.subculture as { id: string; name: string; description: string };

    return {
      id: subculture.id,
      name: subculture.name,
      description: subculture.description,
      userResultId,
    };
  },
};
