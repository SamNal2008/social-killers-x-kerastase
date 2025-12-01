import { supabase } from '~/shared/services/supabase';
import type { ResultsData } from '../types/results';

export const resultsService = {
    async fetchUserResult(userResultId: string): Promise<ResultsData> {
        const { data: userResult, error: userResultError } = await supabase
            .from('user_results')
            .select(`
        id,
        user_id,
        tribe_id,
        created_at,
        tribe:tribes (
          id,
          name
        ),
        user:users (
          id,
          name
        )
      `)
            .eq('id', userResultId)
            .single();

        if (userResultError || !userResult) {
            throw new Error(`Failed to fetch user result: ${userResultError?.message || 'Not found'}`);
        }

        const { data: tribePercentages, error: tribesError } = await supabase
            .from('user_result_tribes')
            .select(`
        tribe_id,
        percentage,
        tribe:tribes (
          id,
          name
        )
      `)
            .eq('user_result_id', userResultId)
            .order('percentage', { ascending: false });

        if (tribesError) {
            throw new Error(`Failed to fetch tribe percentages: ${tribesError.message}`);
        }

        return {
            userResult: {
                id: userResult.id,
                userId: userResult.user_id,
                dominantTribeId: userResult.tribe_id,
                dominantTribeName: (userResult.tribe as { id: string; name: string }).name,
                createdAt: userResult.created_at || '',
            },
            tribePercentages: (tribePercentages || []).map((tp) => ({
                tribeId: tp.tribe_id || '',
                tribeName: (tp.tribe as { id: string; name: string })?.name || '',
                percentage: tp.percentage,
            })),
        };
    },
};
