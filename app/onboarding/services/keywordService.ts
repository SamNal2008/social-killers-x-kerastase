import { supabase } from '~/shared/services/supabase';
import type { Tables } from '~/shared/types/database.types';

export const keywordService = {
    async getAll(): Promise<Tables<'keywords'>[]> {
        const { data, error } = await supabase
            .from('keywords')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to fetch keywords: ${error.message}`);
        }

        return data || [];
    },
};
