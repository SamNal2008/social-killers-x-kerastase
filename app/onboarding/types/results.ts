export interface TribePercentage {
    tribeId: string;
    tribeName: string;
    percentage: number;
}

export interface UserResult {
    id: string;
    userId: string;
    dominantTribeId: string;
    dominantTribeName: string;
    createdAt: string;
}

export interface ResultsData {
    userResult: UserResult;
    tribePercentages: TribePercentage[];
}

export interface ResultsScreenProps {
    userResultId: string;
}
