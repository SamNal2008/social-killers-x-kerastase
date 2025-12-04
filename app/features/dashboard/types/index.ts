export interface DashboardUserResult {
  id: string;
  userId: string;
  userName: string;
  tribeId: string;
  subcultureName: string;
  generatedImageUrl: string | null;
  imageUrls: string[]; // Array of all generated image URLs for rotation
  createdAt: string;
}

export interface DashboardPolaroidProps {
  userName: string;
  subcultureName: string;
  imageUrls: string[];
  timestamp: string;
  className?: string;
  onDelete?: () => void;
}
