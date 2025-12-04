import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Title, Body } from '~/shared/components/Typography';
import { Button } from '~/shared/components/Button';
import { SubcultureUploadRow } from './SubcultureUploadRow';
import {
  moodboardUploadService,
  type SubcultureWithMoodboard,
} from '../../services/moodboardUploadService';
import type { UploadStatus, SubcultureUploadState } from './types';

interface MoodboardImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type UploadStates = Record<string, SubcultureUploadState>;

export const MoodboardImportDialog: FC<MoodboardImportDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [subcultures, setSubcultures] = useState<SubcultureWithMoodboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<UploadStates>({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchSubcultures = useCallback(async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await moodboardUploadService.fetchSubculturesWithMoodboards();
      setSubcultures(data);
      const initialStates: UploadStates = {};
      data.forEach((sub) => {
        initialStates[sub.id] = {
          selectedFile: null,
          uploadStatus: 'idle',
        };
      });
      setUploadStates(initialStates);
    } catch (error) {
      setFetchError('Failed to load subcultures');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSubcultures();
    }
  }, [isOpen, fetchSubcultures]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isSaving]);

  const handleFileSelect = (subcultureId: string, file: File | null) => {
    setUploadStates((prev) => ({
      ...prev,
      [subcultureId]: {
        ...prev[subcultureId],
        selectedFile: file,
        uploadStatus: 'idle',
        errorMessage: undefined,
      },
    }));
  };

  const hasSelectedFiles = Object.values(uploadStates).some(
    (state) => state.selectedFile !== null
  );

  const handleSave = async () => {
    setIsSaving(true);

    const subcultureWithFiles = subcultures.filter(
      (sub) => uploadStates[sub.id]?.selectedFile !== null
    );

    const results: Record<string, boolean> = {};

    for (const subculture of subcultureWithFiles) {
      const state = uploadStates[subculture.id];
      if (!state.selectedFile) continue;

      setUploadStates((prev) => ({
        ...prev,
        [subculture.id]: {
          ...prev[subculture.id],
          uploadStatus: 'uploading' as UploadStatus,
        },
      }));

      const uploadResult = await moodboardUploadService.uploadMoodboardImage(
        state.selectedFile,
        subculture.id
      );

      if (!uploadResult.success) {
        setUploadStates((prev) => ({
          ...prev,
          [subculture.id]: {
            ...prev[subculture.id],
            uploadStatus: 'error' as UploadStatus,
            errorMessage: uploadResult.error,
          },
        }));
        results[subculture.id] = false;
        continue;
      }

      try {
        let moodboardId = subculture.moodboardId;

        if (!moodboardId) {
          moodboardId = await moodboardUploadService.createMoodboardForSubculture(subculture.id);
        }

        await moodboardUploadService.updateMoodboardImageUrl(moodboardId, uploadResult.imageUrl!);

        setUploadStates((prev) => ({
          ...prev,
          [subculture.id]: {
            ...prev[subculture.id],
            uploadStatus: 'success' as UploadStatus,
          },
        }));
        results[subculture.id] = true;
      } catch (error) {
        setUploadStates((prev) => ({
          ...prev,
          [subculture.id]: {
            ...prev[subculture.id],
            uploadStatus: 'error' as UploadStatus,
            errorMessage: error instanceof Error ? error.message : 'Database update failed',
          },
        }));
        results[subculture.id] = false;
      }
    }

    setIsSaving(false);

    const allSucceeded = Object.values(results).length > 0 && Object.values(results).every(Boolean);

    if (allSucceeded && onSuccess) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            data-testid="dialog-backdrop"
            className="absolute inset-0 bg-black/50"
            onClick={isSaving ? undefined : onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog Content */}
          <motion.div
            className="
              relative z-10
              w-full max-w-2xl max-h-[90vh]
              bg-surface-light
              rounded-2xl
              shadow-2xl
              flex flex-col
              overflow-hidden
            "
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-gray/20">
              <Title variant="h2" as="h2" className="text-neutral-dark">
                <span id="dialog-title">Import Moodboard Images</span>
              </Title>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="
                  p-2 rounded-full
                  hover:bg-neutral-gray/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
                aria-label="Close dialog"
              >
                <X className="w-6 h-6 text-neutral-dark" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-neutral-gray" />
                  <span className="ml-3 text-neutral-gray">Loading...</span>
                </div>
              ) : fetchError ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Body variant="1" className="text-feedback-error">
                    {fetchError}
                  </Body>
                  <Button variant="secondary" onClick={fetchSubcultures} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {subcultures.map((subculture) => (
                    <SubcultureUploadRow
                      key={subculture.id}
                      subculture={subculture}
                      selectedFile={uploadStates[subculture.id]?.selectedFile ?? null}
                      onFileSelect={handleFileSelect}
                      uploadStatus={uploadStates[subculture.id]?.uploadStatus ?? 'idle'}
                      errorMessage={uploadStates[subculture.id]?.errorMessage}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 p-6 border-t border-neutral-gray/20">
              <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!hasSelectedFiles || isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
