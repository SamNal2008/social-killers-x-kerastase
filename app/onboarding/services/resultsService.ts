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
            // Fallback to empty mappings, will result in empty subcultures
        }

        // Aggregate subculture scores
        const subcultureMap = new Map<string, { name: string; percentage: number }>();

        (tribePercentages || []).forEach((tp) => {
            if (!tp.tribe_id) return;

            // Find all subcultures for this tribe
            const mappings = (tribeSubcultures || []).filter(ts => ts.tribe_id === tp.tribe_id);

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

        const subculturePercentages = Array.from(subcultureMap.entries()).map(([id, data]) => ({
            subcultureId: id,
            subcultureName: data.name,
            percentage: Math.round(data.percentage * 100) / 100
        })).sort((a, b) => b.percentage - a.percentage);

        const dominantSubculture = subculturePercentages.length > 0 ? subculturePercentages[0] : null;

        return {
            userResult: {
                id: userResult.id,
                userId: userResult.user_id,
                dominantTribeId: userResult.tribe_id,
                dominantTribeName: (userResult.tribe as { id: string; name: string }).name,
                dominantSubcultureId: dominantSubculture?.subcultureId,
                dominantSubcultureName: dominantSubculture?.subcultureName,
                createdAt: userResult.created_at || '',
            },
            tribePercentages: (tribePercentages || []).map((tp) => ({
                tribeId: tp.tribe_id || '',
                tribeName: (tp.tribe as { id: string; name: string })?.name || '',
                percentage: tp.percentage,
            })),
            subculturePercentages,
        };
    },
};
