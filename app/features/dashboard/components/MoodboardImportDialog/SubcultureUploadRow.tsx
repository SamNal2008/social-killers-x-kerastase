import type { FC } from 'react';
import { useRef } from 'react';
import { Upload, X, Check, Loader2, ImageOff } from 'lucide-react';
import type { SubcultureWithMoodboard } from '../../services/moodboardUploadService';
import type { UploadStatus } from './types';
import { Body } from '~/shared/components/Typography';

interface SubcultureUploadRowProps {
  subculture: SubcultureWithMoodboard;
  selectedFile: File | null;
  onFileSelect: (subcultureId: string, file: File | null) => void;
  uploadStatus: UploadStatus;
  errorMessage?: string;
}

export const SubcultureUploadRow: FC<SubcultureUploadRowProps> = ({
  subculture,
  selectedFile,
  onFileSelect,
  uploadStatus,
  errorMessage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadStatus === 'uploading';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(subculture.id, file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleClearFile = () => {
    onFileSelect(subculture.id, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderStatusIndicator = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex items-center gap-2 text-neutral-gray">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2 text-feedback-success">
            <Check className="w-4 h-4" />
            <span className="text-sm">Uploaded</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-feedback-error">
            <X className="w-4 h-4" />
            <span className="text-sm">{errorMessage || 'Upload failed'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-neutral-gray/20 last:border-b-0">
      {/* Current Image Thumbnail */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-gray/10">
        {subculture.currentImageUrl ? (
          <img
            src={subculture.currentImageUrl}
            alt={`Current moodboard for ${subculture.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center text-neutral-gray">
              <ImageOff className="w-5 h-5" />
              <span className="text-xs mt-1">No image</span>
            </div>
          </div>
        )}
      </div>

      {/* Subculture Name */}
      <div className="flex-1 min-w-0">
        <Body variant="1" className="font-medium text-neutral-dark truncate">
          {subculture.name}
        </Body>

        {/* Selected File Info or Status */}
        {selectedFile ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-neutral-gray truncate max-w-[150px]">
              {selectedFile.name}
            </span>
            {uploadStatus === 'idle' && (
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1 rounded hover:bg-neutral-gray/10 transition-colors"
                aria-label="Clear selected file"
              >
                <X className="w-4 h-4 text-neutral-gray" />
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-neutral-gray mt-1 block">No file selected</span>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex-shrink-0">{renderStatusIndicator()}</div>

      {/* File Input and Button */}
      <div className="flex-shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          data-testid={`file-input-${subculture.id}`}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleChooseFile}
          disabled={isUploading}
          className="
            flex items-center gap-2
            px-4 py-2
            bg-neutral-dark text-neutral-white
            rounded-lg
            text-sm font-medium
            hover:bg-neutral-dark/90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Choose file"
        >
          <Upload className="w-4 h-4" />
          Choose file
        </button>
      </div>
    </div>
  );
};
