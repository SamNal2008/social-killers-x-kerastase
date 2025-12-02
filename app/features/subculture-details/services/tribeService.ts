import { supabase } from '~/shared/services/supabase';
import type { TribeDetails } from '../types';

type UserResultWithTribe = {
  id: string;
  tribe: {
    id: string;
    name: string;
    subtitle: string | null;
    text: string | null;
    dos: unknown;
    donts: unknown;
  } | null;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
};

export const tribeService = {
  async fetchTribeByUserResultId(userResultId: string): Promise<TribeDetails> {
    if (userResultId === 'mock-user-result-id') {
      return {
        id: 'mock-tribe-id',
        name: 'Heritage Heiress',
        subtitle: 'You make timeless elegance your own.',
        description: 'You have a deep appreciation for heritage and tradition, and you bring timeless beauty to everything you touch. Whether it is classic lines, impeccable craftsmanship, or pieces that carry a story, you make elegance feel personal, meaningful, and effortlessly enduring.',
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

    const { data, error } = await supabase
      .from('user_results')
      .select(`
        id,
        tribe:tribes (
          id,
          name,
          subtitle,
          text,
          dos,
          donts
        )
      `)
      .eq('id', userResultId)
      .single();

    if (error || !data) {
      throw new Error(`Failed to fetch user result: ${error?.message || 'Not found'}`);
    }

    const userResult = data as UserResultWithTribe;

    if (!userResult.tribe) {
      throw new Error('No tribe found for this user result');
    }

    return {
      id: userResult.tribe.id,
      name: userResult.tribe.name,
      subtitle: userResult.tribe.subtitle ?? '',
      description: userResult.tribe.text ?? '',
      dos: toStringArray(userResult.tribe.dos),
      donts: toStringArray(userResult.tribe.donts),
      userResultId,
    };
  },

  async fetchTribeWithSubcultureName(userResultId: string): Promise<TribeDetails> {
    if (userResultId === 'mock-user-result-id') {
      return {
        id: 'mock-tribe-id',
        name: 'Heritage Heiress',
        subtitle: 'You make timeless elegance your own.',
        description: 'You have a deep appreciation for heritage and tradition, and you bring timeless beauty to everything you touch. Whether it is classic lines, impeccable craftsmanship, or pieces that carry a story, you make elegance feel personal, meaningful, and effortlessly enduring.',
        dos: [
          'Choose quality over quantity',
          'Invest in timeless pieces',
        ],
        donts: [
          'Follow every trend',
          'Compromise on craftsmanship',
        ],
        userResultId,
        subcultureName: 'Heritage Heiress',
      };
    }

    // Fetch user result with tribe details
    const { data: userResult, error: userResultError } = await supabase
      .from('user_results')
      .select(`
        id,
        tribe:tribes (
          id,
          name,
          subtitle,
          text,
          dos,
          donts
        )
      `)
      .eq('id', userResultId)
      .single();

    if (userResultError || !userResult) {
      throw new Error(`Failed to fetch user result: ${userResultError?.message || 'Not found'}`);
    }

    const typedUserResult = userResult as UserResultWithTribe;

    if (!typedUserResult.tribe) {
      throw new Error('No tribe found for this user result');
    }

    // Fetch tribe percentages to calculate dominant subculture
    const { data: tribePercentages, error: tribesError } = await supabase
      .from('user_result_tribes')
      .select(`
        tribe_id,
        percentage
      `)
      .eq('user_result_id', userResultId)
      .order('percentage', { ascending: false });

    if (tribesError) {
      throw new Error(`Failed to fetch tribe percentages: ${tribesError.message}`);
    }

    // Fetch tribe-subculture mappings
    const { data: tribeSubcultures, error: mappingError } = await supabase
      .from('tribe_subcultures')
      .select(`
        tribe_id,
        subculture_id,
        subculture:subcultures (
          id,
          name
        )
      `);

    if (mappingError) {
      console.error('Failed to fetch tribe subcultures:', mappingError);
    }

    // Aggregate subculture scores
    let dominantSubcultureName: string | undefined;

    if (tribePercentages && tribeSubcultures) {
      const subcultureMap = new Map<string, { name: string; percentage: number }>();

      tribePercentages.forEach((tp) => {
        if (!tp.tribe_id) return;

        const mappings = tribeSubcultures.filter(ts => ts.tribe_id === tp.tribe_id);

        mappings.forEach(mapping => {
          if (!mapping.subculture_id || !mapping.subculture) return;

          const current = subcultureMap.get(mapping.subculture_id) || {
            name: (mapping.subculture as { name: string }).name,
            percentage: 0
          };

          current.percentage += tp.percentage;
          subcultureMap.set(mapping.subculture_id, current);
        });
      });

      const subculturePercentages = Array.from(subcultureMap.entries())
        .map(([_, data]) => data)
        .sort((a, b) => b.percentage - a.percentage);

      if (subculturePercentages.length > 0) {
        dominantSubcultureName = subculturePercentages[0].name;
      }
    }

    return {
      id: typedUserResult.tribe.id,
      name: typedUserResult.tribe.name,
      subtitle: typedUserResult.tribe.subtitle ?? '',
      description: typedUserResult.tribe.text ?? '',
      dos: toStringArray(typedUserResult.tribe.dos),
      donts: toStringArray(typedUserResult.tribe.donts),
      userResultId,
      subcultureName: dominantSubcultureName,
    };
  },
};
