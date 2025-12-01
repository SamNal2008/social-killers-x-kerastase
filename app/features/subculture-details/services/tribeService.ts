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
};
