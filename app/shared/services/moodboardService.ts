import { supabase } from './supabase';
import type { Tables } from '~/shared/types/database.types';

export type Moodboard = Tables<'moodboards'>;

export const moodboardService = {
    async getAll(): Promise<Moodboard[]> {
        const { data, error } = await supabase
            .from('moodboards')
            .select('*');

        if (error) {
            throw new Error(`Failed to fetch moodboards: ${error.message}`);
        }

        return data || [];
    }
};
