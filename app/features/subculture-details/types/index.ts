export interface SubcultureDetails {
  id: string;
  name: string;
  // TODO: This will be fetched from Supabase 'subcultures' table
  subtitle: string;
  description: string;
  // TODO: dos and donts will be stored in Supabase as JSON arrays
  dos: string[];
  donts: string[];
  userResultId: string;
}

export interface DetailsScreenProps {
  userResultId: string;
}
