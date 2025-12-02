export interface TribePercentage {
    tribeId: string;
    tribeName: string;
    percentage: number;
}

export interface SubculturePercentage {
    subcultureId: string;
    subcultureName: string;
    percentage: number;
}

export interface UserResult {
    id: string;
    userId: string;
    dominantTribeId: string;
    dominantTribeName: string;
    dominantSubcultureId?: string;
    dominantSubcultureName?: string;
    createdAt: string;
}

export interface ResultsData {
    userResult: UserResult;
    tribePercentages: TribePercentage[];
    subculturePercentages?: SubculturePercentage[];
}

export interface ResultsScreenProps {
    userResultId: string;
}
