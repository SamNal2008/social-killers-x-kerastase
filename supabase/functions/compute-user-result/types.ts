// Request and Response types for compute-user-result Edge Function
// External API uses camelCase, internal database operations use snake_case

export interface ComputeUserResultRequest {
  userAnswerId: string;
}

export interface SubcultureMatch {
  subcultureId: string;
  subcultureName: string;
  percentage: number;
}

export interface ComputeUserResultResponse {
  success: boolean;
  data?: {
    userResultId: string;
    tribeId: string;
    tribeName: string;
    subcultures: SubcultureMatch[];
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GeminiAnalysisResult {
  tribe_id: string;
  tribe_name: string;
  subcultures: Array<{
    subculture_id: string;
    subculture_name: string;
    percentage: number;
  }>;
}

export interface UserAnswerData {
  id: string;
  user_id: string;
  moodboard_id: string;
  brands: string[];
  keywords: string[];
  moodboard: {
    name: string;
    description: string;
  };
}
