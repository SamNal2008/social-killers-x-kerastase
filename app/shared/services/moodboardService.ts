import { supabase } from './supabase';
import type { Tables } from '~/shared/types/database.types';

// Raw moodboard from database (no name/description)
type MoodboardRow = Tables<'moodboards'>;
type SubcultureRow = Tables<'subcultures'>;

// Moodboard with subculture data for display
export interface Moodboard {
    id: string;
    image_url: string | null;
    subculture_id: string | null;
    // Name and description come from the linked subculture
    name: string;
    description: string;
    created_at: string | null;
    updated_at: string | null;
}

// Raw response type from Supabase join query
interface MoodboardWithSubculture extends MoodboardRow {
    subcultures: SubcultureRow | null;
}

export const moodboardService = {
    async getAll(): Promise<Moodboard[]> {
        const { data, error } = await supabase
            .from('moodboards')
            .select(`
                *,
                subcultures (
                    name,
                    description
                )
            `);

        if (error) {
            throw new Error(`Failed to fetch moodboards: ${error.message}`);
        }

        // Transform the data to include name/description from subculture
        return (data as MoodboardWithSubculture[] || []).map((moodboard) => ({
            id: moodboard.id,
            image_url: moodboard.image_url,
            subculture_id: moodboard.subculture_id,
            name: moodboard.subcultures?.name || 'Unknown',
            description: moodboard.subcultures?.description || '',
            created_at: moodboard.created_at,
            updated_at: moodboard.updated_at,
        }));
    }
};
