import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PREMIUM_EASE } from '~/shared/animations/transitions';
import { Upload, Trash2, Search, X } from 'lucide-react';
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

interface ClearAllState {
  isOpen: boolean;
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
  const [clearAllState, setClearAllState] = useState<ClearAllState>({
    isOpen: false,
    isDeleting: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const previousResultIdsRef = useRef<Set<string>>(new Set());
  const [newResultIds, setNewResultIds] = useState<Set<string>>(new Set());

  const fetchResults = useCallback(async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }
      const data = await dashboardService.getUserResults();

      if (!isInitialLoad) {
        const currentIds = new Set(data.map((r) => r.id));
        const newIds = new Set<string>();
        currentIds.forEach((id) => {
          if (!previousResultIdsRef.current.has(id)) {
            newIds.add(id);
          }
        });
        setNewResultIds(newIds);

        if (newIds.size > 0) {
          setTimeout(() => setNewResultIds(new Set()), 500);
        }
      }

      previousResultIdsRef.current = new Set(data.map((r) => r.id));
      setResults(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard data'));
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchResults(true);

    const intervalId = setInterval(() => {
      fetchResults(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchResults]);

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

  const handleClearAllClick = () => {
    setDeleteError(null);
    setClearAllState({ isOpen: true, isDeleting: false });
  };

  const handleClearAllCancel = () => {
    setClearAllState({ isOpen: false, isDeleting: false });
  };

  const handleClearAllConfirm = async () => {
    setClearAllState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await Promise.all(results.map((result) => dashboardService.deleteResult(result.id)));
      setResults([]);
      setClearAllState({ isOpen: false, isDeleting: false });
    } catch (err) {
      if (err instanceof ResultNotFoundError) {
        window.location.reload();
        return;
      }
      setDeleteError('Failed to clear all results. Please try again.');
      setClearAllState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const filteredResults = searchQuery.trim()
    ? results.filter((result) =>
      result.userName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : results;

  const handleClearSearch = () => {
    setSearchQuery('');
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
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={handleClearAllClick}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsImportDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Import Moodboards
              </Button>
            </div>
          </div>
          <Body variant="1" className="text-neutral-dark">
            Live dashboard
          </Body>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray-200" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                pl-10
                pr-10
                py-3
                border
                border-neutral-gray-200
                rounded-lg
                bg-white
                text-neutral-dark
                placeholder:text-neutral-gray-200
                focus:outline-none
                focus:ring-2
                focus:ring-primary
                focus:border-transparent
                transition-all
              "
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-gray-100 rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-neutral-gray-200" />
              </button>
            )}
          </div>
          {searchQuery && (
            <Body variant="2" className="text-neutral-gray-200">
              {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found for "{searchQuery}"
            </Body>
          )}
          <div data-testid="header-divider" className="bg-primary h-px w-full" />
        </header>

        <section className="flex flex-wrap gap-16 items-center justify-center w-full">
          <AnimatePresence mode="popLayout">
            {filteredResults.map((result) => (
              <motion.div
                key={result.id}
                initial={newResultIds.has(result.id) ? { opacity: 0, x: -100 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.35, ease: PREMIUM_EASE }}
                layout
              >
                <DashboardPolaroid
                  userName={result.userName}
                  subcultureName={result.subcultureName}
                  imageUrls={result.imageUrls}
                  timestamp={result.createdAt}
                  onDelete={() => handleDeleteClick(result.id, result.userName)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
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

      <DeleteConfirmationDialog
        isOpen={clearAllState.isOpen}
        userName={`all ${results.length} results`}
        isDeleting={clearAllState.isDeleting}
        onConfirm={handleClearAllConfirm}
        onCancel={handleClearAllCancel}
      />
    </main>
  );
};
