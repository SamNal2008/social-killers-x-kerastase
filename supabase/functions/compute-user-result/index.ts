import { createClient } from 'jsr:@supabase/supabase-js@2';
import type { Database } from '../../../app/shared/types/database.types.ts';
import { GeminiService } from './gemini-service.ts';
import type {
  ComputeUserResultRequest,
  ComputeUserResultResponse,
  UserAnswerData,
} from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    let requestBody: ComputeUserResultRequest;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Request body must be valid JSON',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate userAnswerId
    if (!requestBody.userAnswerId || typeof requestBody.userAnswerId !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'userAnswerId is required and must be a string',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Server configuration error',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Fetch user answer with moodboard details
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
          description
        )
      `)
      .eq('id', requestBody.userAnswerId)
      .single();

    if (fetchError || !userAnswer) {
      console.error('Failed to fetch user answer:', fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'USER_ANSWER_NOT_FOUND',
            message: 'User answer not found',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all available subcultures
    const { data: subcultures, error: subculturesError } = await supabase
      .from('subcultures')
      .select('id, name, description');

    if (subculturesError || !subcultures || subcultures.length === 0) {
      console.error('Failed to fetch subcultures:', subculturesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATA_ERROR',
            message: 'Failed to fetch subcultures data',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all available tribes
    const { data: tribes, error: tribesError } = await supabase
      .from('tribes')
      .select('id, name, description');

    if (tribesError || !tribes || tribes.length === 0) {
      console.error('Failed to fetch tribes:', tribesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATA_ERROR',
            message: 'Failed to fetch tribes data',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Gemini service
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Missing GEMINI_API_KEY');
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'CONFIGURATION_ERROR',
            message: 'Gemini API key not configured',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiService = new GeminiService(geminiApiKey);

    // Prepare user answer data
    const userAnswerData: UserAnswerData = {
      id: userAnswer.id,
      user_id: userAnswer.user_id,
      moodboard_id: userAnswer.moodboard_id,
      brands: userAnswer.brands,
      keywords: userAnswer.keywords,
      moodboard: Array.isArray(userAnswer.moodboard)
        ? userAnswer.moodboard[0]
        : userAnswer.moodboard,
    };

    // Call Gemini to analyze user preferences
    let analysisResult;
    try {
      analysisResult = await geminiService.analyzeUserPreferences(
        userAnswerData,
        subcultures,
        tribes
      );
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'GEMINI_ERROR',
            message: error instanceof Error ? error.message : 'Failed to analyze user preferences',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create user result
    const { data: userResult, error: resultError } = await supabase
      .from('user_results')
      .insert({
        user_id: userAnswer.user_id,
        user_answer_id: userAnswer.id,
        tribe_id: analysisResult.tribe_id,
      })
      .select()
      .single();

    if (resultError || !userResult) {
      console.error('Failed to create user result:', resultError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save user result',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create subculture associations
    const subcultureInserts = analysisResult.subcultures.map(s => ({
      user_result_id: userResult.id,
      subculture_id: s.subculture_id,
      percentage: s.percentage,
    }));

    const { error: subcultureError } = await supabase
      .from('user_result_subcultures')
      .insert(subcultureInserts);

    if (subcultureError) {
      console.error('Failed to create subculture associations:', subcultureError);
      // Rollback: delete the user result
      await supabase.from('user_results').delete().eq('id', userResult.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to save subculture associations',
          },
        } satisfies ComputeUserResultResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response with camelCase
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          userResultId: userResult.id,
          tribeId: analysisResult.tribe_id,
          tribeName: analysisResult.tribe_name,
          subcultures: analysisResult.subcultures.map(s => ({
            subcultureId: s.subculture_id,
            subcultureName: s.subculture_name,
            percentage: s.percentage,
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
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      } satisfies ComputeUserResultResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
