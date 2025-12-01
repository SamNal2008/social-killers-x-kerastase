import { supabase } from '~/shared/services/supabase';
import type { TablesInsert } from '~/shared/types/database.types';

export const userAnswerService = {
    async create(answer: TablesInsert<'user_answers'>) {
        const { data, error } = await supabase
            .from('user_answers')
            .insert(answer)
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to save user answers: ${error.message}`);
        }

        return data;
    },
};
