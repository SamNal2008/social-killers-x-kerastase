export interface DashboardUserResult {
  id: string;
  userId: string;
  userName: string;
  tribeId: string;
  tribeName: string;
  generatedImageUrl: string | null;
  imageUrls: string[]; // Array of all generated image URLs for rotation
  createdAt: string;
}

export interface DashboardPolaroidProps {
  userName: string;
  tribeName: string;
  imageUrls: string[]; // Array of image URLs to rotate through
  timestamp: string;
  className?: string;
}
