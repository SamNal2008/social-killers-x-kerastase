export interface TribeDetails {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  dos: string[];
  donts: string[];
  userResultId: string;
}

export interface DetailsScreenProps {
  userResultId: string;
}
