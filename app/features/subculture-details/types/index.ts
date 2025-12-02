export interface TribeDetails {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  dos: string[];
  donts: string[];
  userResultId: string;
  subcultureName?: string; // Optional: dominant subculture name
}

export interface SubcultureDetails {
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
