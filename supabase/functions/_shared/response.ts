// Shared response utilities for Edge Functions

export function jsonResponse<T>(data: T, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
    });
}

export function errorResponse(message: string, status = 400): Response {
    return jsonResponse({ error: message }, status);
}

export function corsHeaders(): HeadersInit {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
}
