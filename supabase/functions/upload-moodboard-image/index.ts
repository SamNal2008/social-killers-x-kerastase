import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = 'moodboard_pictures';

interface UploadMoodboardImageRequest {
    subcultureId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string; // base64 encoded file data
}

interface UploadMoodboardImageResponse {
    success: boolean;
    data?: {
        imageUrl: string;
    };
    error?: {
        code: string;
        message: string;
    };
}

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
        } satisfies UploadMoodboardImageResponse),
        {
            status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
    );
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Only allow POST
        if (req.method !== 'POST') {
            return buildErrorResponse('METHOD_NOT_ALLOWED', 'Only POST method is allowed', 405);
        }

        // Parse request body
        let requestBody: UploadMoodboardImageRequest;
        try {
            requestBody = await req.json();
        } catch {
            return buildErrorResponse('INVALID_JSON', 'Request body must be valid JSON', 400);
        }

        // Validate required fields
        if (!requestBody.subcultureId || typeof requestBody.subcultureId !== 'string') {
            return buildErrorResponse('INVALID_REQUEST', 'subcultureId is required and must be a string', 400);
        }

        if (!requestBody.fileName || typeof requestBody.fileName !== 'string') {
            return buildErrorResponse('INVALID_REQUEST', 'fileName is required and must be a string', 400);
        }

        if (!requestBody.fileType || typeof requestBody.fileType !== 'string') {
            return buildErrorResponse('INVALID_REQUEST', 'fileType is required and must be a string', 400);
        }

        if (!requestBody.fileData || typeof requestBody.fileData !== 'string') {
            return buildErrorResponse('INVALID_REQUEST', 'fileData is required and must be a base64 string', 400);
        }

        if (typeof requestBody.fileSize !== 'number') {
            return buildErrorResponse('INVALID_REQUEST', 'fileSize is required and must be a number', 400);
        }

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(requestBody.subcultureId)) {
            return buildErrorResponse('INVALID_REQUEST', 'subcultureId must be a valid UUID', 400);
        }

        // Validate file type
        if (!ALLOWED_MIME_TYPES.includes(requestBody.fileType)) {
            return buildErrorResponse(
                'INVALID_FILE_TYPE',
                'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
                400
            );
        }

        // Validate file size
        if (requestBody.fileSize > MAX_FILE_SIZE_BYTES) {
            return buildErrorResponse(
                'FILE_TOO_LARGE',
                'File size exceeds 10MB limit.',
                400
            );
        }

        // Initialize Supabase client with service role key
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase configuration');
            return buildErrorResponse('CONFIGURATION_ERROR', 'Server configuration error', 500);
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
                detectSessionInUrl: false
            }
        });

        // Decode base64 file data
        const base64Data = requestBody.fileData.replace(/^data:image\/\w+;base64,/, '');
        const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        const blob = new Blob([binaryData], { type: requestBody.fileType });

        // Generate file path
        const timestamp = Date.now();
        const filePath = `${requestBody.subcultureId}/${timestamp}_${requestBody.fileName}`;

        console.log(`Uploading moodboard image: ${filePath}`);

        // Upload to storage
        const { data, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(filePath, blob, {
                contentType: requestBody.fileType,
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return buildErrorResponse('UPLOAD_ERROR', uploadError.message, 500);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(data.path);

        // Replace internal Kong URL with public-facing URL for local development
        const publicFacingUrl = Deno.env.get('PUBLIC_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || '';
        const publicUrl = urlData.publicUrl.replace('http://kong:8000', publicFacingUrl);

        console.log(`Successfully uploaded moodboard image: ${publicUrl}`);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    imageUrl: publicUrl,
                },
            } satisfies UploadMoodboardImageResponse),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return buildErrorResponse('INTERNAL_ERROR', errorMessage, 500);
    }
});
