import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Title, Body } from '~/shared/components/Typography';
import { Button } from '~/shared/components/Button';
import { DashboardPolaroid } from './DashboardPolaroid';
import { MoodboardImportDialog } from './MoodboardImportDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { dashboardService, ResultNotFoundError } from '../services/dashboardService';
import type { DashboardUserResult } from '../types';

interface DeleteState {
  isOpen: boolean;
  resultId: string | null;
  userName: string;
  isDeleting: boolean;
}

export const DashboardScreen: FC = () => {
  const [results, setResults] = useState<DashboardUserResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isOpen: false,
    resultId: null,
    userName: '',
    isDeleting: false,
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await dashboardService.getUserResults();
        setResults(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, []);

  const handleImportSuccess = () => {
    setIsImportDialogOpen(false);
  };

  const handleDeleteClick = (resultId: string, userName: string) => {
    setDeleteError(null);
    setDeleteState({
      isOpen: true,
      resultId,
      userName,
      isDeleting: false,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteState({
      isOpen: false,
      resultId: null,
      userName: '',
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.resultId) return;

    setDeleteState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await dashboardService.deleteResult(deleteState.resultId);
      setResults((prev) => prev.filter((r) => r.id !== deleteState.resultId));
      setDeleteState({
        isOpen: false,
        resultId: null,
        userName: '',
        isDeleting: false,
      });
    } catch (err) {
      if (err instanceof ResultNotFoundError) {
        window.location.reload();
        return;
      }
      setDeleteError('Failed to delete result. Please try again.');
      setDeleteState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  if (isLoading) {
    return (
      <main className="bg-surface-light min-h-screen flex items-center justify-center">
        <Body variant="1" className="text-neutral-dark">
          Loading dashboard...
        </Body>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-surface-light min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Title variant="h2" className="text-feedback-error mb-4">
            Error
          </Title>
          <Body variant="1" className="text-neutral-dark">
            {error.message}
          </Body>
        </div>
      </main>
    );
  }

  if (results.length === 0) {
    return (
      <main className="bg-surface-light min-h-screen flex items-center justify-center">
        <Body variant="1" className="text-neutral-dark">
          No results available yet.
        </Body>
      </main>
    );
  }

  return (
    <main className="bg-surface-light min-h-screen w-full">
      <div className="flex flex-col gap-16 items-center px-16 py-8 w-full max-w-[1440px] mx-auto">
        <header className="flex flex-col gap-4 items-start justify-center w-full">
          <div className="flex items-center justify-between w-full">
            <Title variant="h0" className="text-neutral-dark">
              Kérastase collective
            </Title>
            <Button
              variant="secondary"
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Moodboards
            </Button>
          </div>
          <Body variant="1" className="text-neutral-dark">
            Live dashboard
          </Body>
          <div data-testid="header-divider" className="bg-primary h-px w-full" />
        </header>

        <section className="flex flex-wrap gap-16 items-center justify-center w-full">
          {results.map((result) => (
            <DashboardPolaroid
              key={result.id}
              userName={result.userName}
              subcultureName={result.subcultureName}
              imageUrls={result.imageUrls}
              timestamp={result.createdAt}
              onDelete={() => handleDeleteClick(result.id, result.userName)}
            />
          ))}
        </section>

        {deleteError && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-feedback-error text-white px-6 py-3 rounded-lg shadow-lg">
            <Body variant="2">{deleteError}</Body>
          </div>
        )}
      </div>

      <MoodboardImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <DeleteConfirmationDialog
        isOpen={deleteState.isOpen}
        userName={deleteState.userName}
        isDeleting={deleteState.isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </main>
  );
};
