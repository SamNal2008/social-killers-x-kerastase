import { useEffect, useState } from 'react';
import { tribeService } from '../services/tribeService';
import type { TribeDetails } from '../types';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export const useTribeDetails = (userResultId: string) => {
  const [tribeData, setTribeData] = useState<TribeDetails | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTribe = async () => {
      try {
        setLoadingState('loading');
        const data = await tribeService.fetchTribeByUserResultId(userResultId);
        setTribeData(data);
        setLoadingState('success');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load tribe'));
        setLoadingState('error');
      }
    };

    fetchTribe();
  }, [userResultId]);

  return { tribeData, loadingState, error };
};
