// Type definitions for generate-image Edge Function

export interface GenerateImageRequest {
    userResultId: string;
    userPhoto: string; // Base64 encoded image
}

export interface GenerateImageResponse {
    imageUrl: string;
    userResultId: string;
}

export interface GeminiImageResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{
                text?: string;
                inlineData?: {
                    mimeType: string;
                    data: string;
                };
            }>;
        };
    }>;
}
