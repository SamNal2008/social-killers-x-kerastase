import type { FC } from 'react';
import { Skeleton } from '~/shared/components/Skeleton';

export const ResultsScreenSkeleton: FC = () => {
  return (
    <div
      className="bg-surface-light min-h-screen p-6 md:p-8"
      data-testid="results-skeleton"
      aria-busy="true"
      aria-label="Loading results"
    >
      <div
        className="flex flex-col gap-10 md:gap-12 w-full max-w-[345px] md:max-w-4xl mx-auto"
        data-testid="results-skeleton-inner"
      >
        {/* Title Skeleton */}
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <Skeleton
              width="80%"
              height="48px"
              rounded="md"
              data-testid="skeleton-title"
            />
          </div>

          {/* Body Text Skeleton (2 lines) */}
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col gap-2 w-full max-w-md">
              <Skeleton
                width="100%"
                height="20px"
                rounded="md"
                data-testid="skeleton-body-line-1"
              />
              <Skeleton
                width="85%"
                height="20px"
                rounded="md"
                data-testid="skeleton-body-line-2"
                className="mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Subculture Cards Skeleton (Top 3) */}
        <div className="flex flex-col gap-8 w-full">
          {/* Card 1 - Largest (h1) */}
          <div className="flex flex-col gap-3" data-testid="skeleton-card-1">
            <div className="flex items-center gap-4 w-full">
              {/* Rank Number */}
              <Skeleton
                width="24px"
                height="20px"
                rounded="sm"
                data-testid="skeleton-card-1-rank"
              />

              <div className="flex justify-between items-end w-full">
                {/* Subculture Name */}
                <Skeleton
                  width="50%"
                  height="48px"
                  rounded="md"
                  className="h-12"
                  data-testid="skeleton-card-1-title"
                />

                {/* Percentage */}
                <Skeleton
                  width="80px"
                  height="16px"
                  rounded="sm"
                  className="mb-1"
                  data-testid="skeleton-card-1-percentage"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <Skeleton
              width="100%"
              height="4px"
              rounded="full"
              className="h-[4px]"
              data-testid="skeleton-card-1-progress"
            />
          </div>

          {/* Card 2 - Medium (h2) */}
          <div className="flex flex-col gap-3" data-testid="skeleton-card-2">
            <div className="flex items-center gap-4 w-full">
              {/* Rank Number */}
              <Skeleton
                width="24px"
                height="16px"
                rounded="sm"
                data-testid="skeleton-card-2-rank"
              />

              <div className="flex justify-between items-end w-full">
                {/* Subculture Name */}
                <Skeleton
                  width="45%"
                  height="40px"
                  rounded="md"
                  className="h-10"
                  data-testid="skeleton-card-2-title"
                />

                {/* Percentage */}
                <Skeleton
                  width="80px"
                  height="16px"
                  rounded="sm"
                  className="mb-1"
                  data-testid="skeleton-card-2-percentage"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <Skeleton
              width="100%"
              height="4px"
              rounded="full"
              className="h-[4px]"
              data-testid="skeleton-card-2-progress"
            />
          </div>

          {/* Card 3 - Smallest (h3) */}
          <div className="flex flex-col gap-3" data-testid="skeleton-card-3">
            <div className="flex items-center gap-4 w-full">
              {/* Rank Number */}
              <Skeleton
                width="20px"
                height="12px"
                rounded="sm"
                data-testid="skeleton-card-3-rank"
              />

              <div className="flex justify-between items-end w-full">
                {/* Subculture Name */}
                <Skeleton
                  width="40%"
                  height="32px"
                  rounded="md"
                  className="h-8"
                  data-testid="skeleton-card-3-title"
                />

                {/* Percentage */}
                <Skeleton
                  width="80px"
                  height="16px"
                  rounded="sm"
                  className="mb-1"
                  data-testid="skeleton-card-3-percentage"
                />
              </div>
            </div>

            {/* Progress Bar */}
            <Skeleton
              width="100%"
              height="4px"
              rounded="full"
              className="h-[4px]"
              data-testid="skeleton-card-3-progress"
            />
          </div>
        </div>

        {/* Button Skeleton */}
        <div className="w-full">
          <Skeleton
            width="100%"
            height="52px"
            rounded="lg"
            className="h-[52px]"
            data-testid="skeleton-button"
          />
        </div>
      </div>
    </div>
  );
};
