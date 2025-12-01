import { supabase } from '~/shared/services/supabase';

interface TribeMatch {
    tribeId: string;
    tribeName: string;
    percentage: number;
}

type ComputeUserResultResponse =
    | {
        success: true;
        data: {
            userResultId: string;
            subcultureId: string;
            subcultureName: string;
            dominantTribeId: string;
            dominantTribeName: string;
            tribes: TribeMatch[];
        };
    }
    | {
        success: false;
        error: {
            code: string;
            message: string;
        };
    };

export const computeResultService = {
    async compute(userAnswerId: string): Promise<string> {
        // Get the anon key to use as Bearer token for public edge function access
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

        const { data, error } = await supabase.functions.invoke<ComputeUserResultResponse>(
            'compute-user-result',
            {
                body: { userAnswerId },
                headers: {
                    Authorization: `Bearer ${anonKey}`,
                },
            }
        );

        if (error) {
            throw new Error(`Failed to compute results: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned from compute-user-result function');
        }

        if (!data.success) {
            throw new Error(`Compute result failed: ${data.error.message}`);
        }

        return data.data.userResultId;
    },
};
