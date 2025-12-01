// Request/response handlers for generate-image Edge Function

import type { GenerateImageRequest, GenerateImageResponse } from './types.ts';
import { processImageGeneration } from './services.ts';
import { jsonResponse, errorResponse } from '../_shared/response.ts';
import { ValidationError, AppError } from '../_shared/errors.ts';

/**
 * Validates the request body
 */
function validateRequest(body: unknown): GenerateImageRequest {
    if (!body || typeof body !== 'object') {
        throw new ValidationError('Request body is required');
    }

    const request = body as Record<string, unknown>;

    if (!request.userResultId || typeof request.userResultId !== 'string') {
        throw new ValidationError('userResultId is required and must be a string');
    }

    if (!request.userPhoto || typeof request.userPhoto !== 'string') {
        throw new ValidationError('userPhoto is required and must be a base64 string');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.userResultId)) {
        throw new ValidationError('userResultId must be a valid UUID');
    }

    // Validate base64 image format
    const base64Regex = /^(data:image\/\w+;base64,)?[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(request.userPhoto.substring(0, 100))) {
        throw new ValidationError('userPhoto must be a valid base64 encoded image');
    }

    return {
        userResultId: request.userResultId,
        userPhoto: request.userPhoto,
    };
}

/**
 * Handles the image generation request
 */
export async function handleGenerateImage(req: Request): Promise<Response> {
    try {
        // Parse request body
        const body = await req.json();

        // Validate request
        const validatedRequest = validateRequest(body);

        console.log(`Processing image generation for user result: ${validatedRequest.userResultId}`);

        // Process image generation
        const imageUrl = await processImageGeneration(validatedRequest);

        // Return response
        const response: GenerateImageResponse = {
            imageUrl,
            userResultId: validatedRequest.userResultId,
        };

        return jsonResponse(response, 201);
    } catch (error) {
        console.error('Error in handleGenerateImage:', error);

        if (error instanceof AppError) {
            return errorResponse(error.message, error.statusCode);
        }

        return errorResponse(
            'An unexpected error occurred during image generation',
            500
        );
    }
}
