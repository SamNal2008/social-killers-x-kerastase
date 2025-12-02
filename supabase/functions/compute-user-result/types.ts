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

export interface SubcultureMatch {
  subcultureId: string;
  subcultureName: string;
  percentage: number;
}

export type ComputeUserResultResponse =
  | {
    success: true;
    data: {
      userResultId: string;
      subcultureId: string;
      subcultureName: string;
      dominantTribeId: string;
      dominantTribeName: string;
      dominantSubcultureId: string;
      dominantSubcultureName: string;
      tribes: TribeMatch[];
      subcultures: SubcultureMatch[];
    };
  }
  | {
    success: false;
    error: {
      code: string;
      message: string;
    };
  };

export interface UserAnswerData {
  id: string;
  user_id: string;
  moodboard_id: string;
  brands: string[];
  keywords: string[];
  moodboard: {
    subculture_id: string;
    subculture: {
      id: string;
      name: string;
      description: string;
    };
  };
}
