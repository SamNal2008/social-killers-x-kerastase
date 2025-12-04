export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface SubcultureUploadState {
  selectedFile: File | null;
  uploadStatus: UploadStatus;
  errorMessage?: string;
}
