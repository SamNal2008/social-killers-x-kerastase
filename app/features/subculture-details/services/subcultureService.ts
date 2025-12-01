import { supabase } from '~/shared/services/supabase';
import type { SubcultureDetails } from '../types';

export const subcultureService = {
  async fetchSubcultureByUserResultId(userResultId: string): Promise<SubcultureDetails> {
    // DEVELOPMENT MODE: Return mock data when using mock ID
    if (userResultId === 'mock-user-result-id') {
      return {
        id: 'mock-subculture-id',
        name: 'Legacist',
        subtitle: 'You make timeless elegance your own',
        description: 'You have a deep appreciation for heritage and tradition, and you bring timeless beauty to everything you touch. Whether it\'s classic lines, impeccable craftsmanship, or pieces that carry a story, you know how to make elegance feel personal, meaningful, and effortlessly enduring.',
        dos: [
          'Choose quality over quantity',
          'Invest in timeless pieces',
        ],
        donts: [
          'Follow every trend',
          'Compromise on craftsmanship',
        ],
        userResultId,
      };
    }

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

    // TODO: BACKEND INTEGRATION REQUIRED
    // The following fields need to be added to the Supabase 'subcultures' table:
    // - subtitle (TEXT): Short subculture tagline (e.g., "You make timeless elegance your own")
    // - dos (JSONB): Array of strings for DO recommendations
    // - donts (JSONB): Array of strings for DON'T recommendations
    // Update the query above to fetch these fields when backend is ready

    // MOCK DATA - Replace with actual Supabase data
    const mockSubtitle = 'You make timeless elegance your own';
    const mockDos = [
      'Choose quality over quantity',
      'Invest in timeless pieces',
    ];
    const mockDonts = [
      'Follow every trend',
      'Compromise on craftsmanship',
    ];

    return {
      id: subculture.id,
      name: subculture.name,
      subtitle: mockSubtitle,
      description: subculture.description,
      dos: mockDos,
      donts: mockDonts,
      userResultId,
    };
  },
};
