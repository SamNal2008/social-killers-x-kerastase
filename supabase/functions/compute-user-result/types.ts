// Request and Response types for compute-user-result Edge Function
// External API uses camelCase, internal database operations use snake_case

export interface ComputeUserResultRequest {
  userAnswerId: string;
}

export interface TribeMatch {
  tribeId: string;
  tribeName: string;
  percentage: number;
}

export interface ComputeUserResultResponse {
  success: boolean;
  data?: {
    userResultId: string;
    subcultureId: string;
    subcultureName: string;
    dominantTribeId: string;
    dominantTribeName: string;
    tribes: TribeMatch[];
  };
  error?: {
    code: string;
    message: string;
  };
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
    subculture_id: string;
    subculture: {
      id: string;
      name: string;
      description: string;
    };
  };
}
