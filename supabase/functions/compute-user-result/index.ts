import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import type { Database } from '../../../app/shared/types/database.types.ts';
import type {
  ComputeUserResultRequest,
  ComputeUserResultResponse,
  UserAnswerData,
} from './types.ts';
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TribeCount {
  count: number;
  name: string;
}

interface TribeCounts {
  [tribeId: string]: TribeCount;
}

interface DominantTribe {
  id: string;
  name: string;
}

interface TribeData {
  tribe_id: string;
  tribe: {
    id: string;
    name: string;
  };
}

const extractMoodboardSubculture = (userAnswer: UserAnswerData) => {
  if (!userAnswer.moodboard?.subculture) {
    throw new Error('Moodboard has no associated subculture');
  }

  return userAnswer.moodboard.subculture;
};

const fetchTribesByIds = async (
  supabase: SupabaseClient<Database>,
  tableName: 'keywords' | 'brands',
  ids: string[]
): Promise<TribeData[]> => {
  const { data } = await supabase
    .from(tableName)
    .select('tribe_id, tribe:tribes(id, name)')
    .in('id', ids);

  return (data as TribeData[]) || [];
};

const countTribes = (keywordTribes: TribeData[], brandTribes: TribeData[]): TribeCounts => {
  const tribeCounts: TribeCounts = {};

  const processTribes = (items: TribeData[]) => {
    items.forEach(item => {
      if (item.tribe) {
        if (!tribeCounts[item.tribe.id]) {
          tribeCounts[item.tribe.id] = { count: 0, name: item.tribe.name };
        }
        tribeCounts[item.tribe.id].count++;
      }
    });
  };

  processTribes(keywordTribes);
  processTribes(brandTribes);

  return tribeCounts;
};

const findDominantTribe = (tribeCounts: TribeCounts): DominantTribe => {
  let dominantTribeId = '';
  let dominantTribeName = '';
  let maxCount = 0;

  Object.entries(tribeCounts).forEach(([tribeId, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      dominantTribeId = tribeId;
      dominantTribeName = data.name;
    }
  });

  return { id: dominantTribeId, name: dominantTribeName };
};

const calculateTotalSelections = (tribeCounts: TribeCounts): number => {
  return Object.values(tribeCounts).reduce((sum, t) => sum + t.count, 0);
};

const calculateTribePercentage = (count: number, total: number): number => {
  return total > 0 ? Math.round((count / total) * 10000) / 100 : 0;
};

const buildErrorResponse = (
  code: string,
  message: string,
  status: number
): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        code,
        message,
      },
    } satisfies ComputeUserResultResponse),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return buildErrorResponse('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405);
    }

    // Parse and validate request body
    let requestBody: ComputeUserResultRequest;
    try {
      requestBody = await req.json();
    } catch {
      return buildErrorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
    }

    // Validate userAnswerId
    if (!requestBody.userAnswerId || typeof requestBody.userAnswerId !== 'string') {
      return buildErrorResponse('INVALID_REQUEST', 'userAnswerId is required and must be a string', 400);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return buildErrorResponse('CONFIGURATION_ERROR', 'Server configuration error', 500);
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Fetch user answer with moodboard and subculture details
    const { data: userAnswer, error: fetchError } = await supabase
      .from('user_answers')
      .select(`
        id,
        user_id,
        moodboard_id,
        brands,
        keywords,
        moodboard:moodboards (
          name,
          description,
          subculture_id,
          subculture:subcultures (
            id,
            name,
            description
          )
        )
      `)
      .eq('id', requestBody.userAnswerId)
      .single();

    if (fetchError || !userAnswer) {
      throw new Error('User answer not found');
    }

    // Extract moodboard and subculture
    const subculture = extractMoodboardSubculture(userAnswer);

    // Fetch tribes for selected keywords and brands
    const keywordTribes = await fetchTribesByIds(supabase, 'keywords', userAnswer.keywords);
    const brandTribes = await fetchTribesByIds(supabase, 'brands', userAnswer.brands);

    // Count tribe occurrences
    const tribeCounts = countTribes(keywordTribes, brandTribes);

    // Find dominant tribe
    const dominantTribe = findDominantTribe(tribeCounts);

    // Calculate total selections
    const totalSelections = calculateTotalSelections(tribeCounts);

    // Create user result
    const { data: userResult } = await supabase
      .from('user_results')
      .insert({
        user_id: userAnswer.user_id,
        user_answer_id: userAnswer.id,
        tribe_id: dominantTribe.id,
      })
      .select()
      .single();

    if (!userResult) {
      throw new Error('Failed to create user result');
    }

    // Create tribe percentage associations
    const tribeInserts = Object.entries(tribeCounts).map(([tribeId, data]) => ({
      user_result_id: userResult.id,
      tribe_id: tribeId,
      percentage: calculateTribePercentage(data.count, totalSelections),
    }));

    await supabase
      .from('user_result_tribes')
      .insert(tribeInserts);

    // Return success response with camelCase
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userResultId: userResult.id,
          subcultureId: subculture.id,
          subcultureName: subculture.name,
          dominantTribeId: dominantTribe.id,
          dominantTribeName: dominantTribe.name,
          tribes: Object.entries(tribeCounts).map(([tribeId, data]) => ({
            tribeId,
            tribeName: data.name,
            percentage: calculateTribePercentage(data.count, totalSelections),
          })),
        },
      } satisfies ComputeUserResultResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return buildErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
});
