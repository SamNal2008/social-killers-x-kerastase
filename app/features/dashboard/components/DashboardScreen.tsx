import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Title, Body } from '~/shared/components/Typography';
import { DashboardPolaroid } from './DashboardPolaroid';
import { dashboardService } from '../services/dashboardService';
import type { DashboardUserResult } from '../types';

export const DashboardScreen: FC = () => {
  const [results, setResults] = useState<DashboardUserResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
          <Title variant="h0" className="text-neutral-dark w-full">
            Kérastase collective
          </Title>
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
              tribeName={result.tribeName}
              imageUrls={result.imageUrls}
              timestamp={result.createdAt}
            />
          ))}
        </section>
      </div>
    </main>
  );
};
