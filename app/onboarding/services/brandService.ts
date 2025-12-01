import { supabase } from '~/shared/services/supabase';
import type { Tables } from '~/shared/types/database.types';

export const brandService = {
    async getAll(): Promise<Tables<'brands'>[]> {
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');

        if (error) {
            throw new Error(`Failed to fetch brands: ${error.message}`);
        }

        return data || [];
    },
};
