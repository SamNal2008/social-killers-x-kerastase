import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '~/shared/components/Button/Button';
import { Body } from '~/shared/components/Typography/Body';
import { Caption } from '~/shared/components/Typography/Caption';
import { Title } from '~/shared/components/Typography/Title';
import { userService } from '~/shared/services/userService';
import type { Tables } from '~/shared/types/database.types';
import heroImage from './hero-image.png';

type User = Tables<'users'>;

type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; user: User }
  | { status: 'error'; error: Error };

export const Welcome: FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const isLoading = loadingState.status === 'loading';
  const isError = loadingState.status === 'error';

  const handleBeginExperience = async (): Promise<void> => {
    // Prevent multiple clicks using ref for immediate check
    if (isLoading) {
      return;
    }
    setLoadingState({ status: 'loading' });

    try {
      const user = await userService.create();

      setLoadingState({ status: 'success', user });
    } catch (error) {
      const appError = error instanceof Error
        ? error
        : new Error('An unexpected error occurred');

      setLoadingState({ status: 'error', error: appError });
    }
  };

  return (
    <main className="bg-[var(--color-surface-light)] flex items-center justify-center min-h-screen p-6 md:p-8 lg:p-12">
      <div className="flex flex-col gap-10 md:gap-12 lg:gap-14 items-center w-full max-w-[344.914px] md:max-w-md lg:max-w-lg">
        {/* Caption */}
        <div className="flex items-center justify-center w-full">
          <Caption variant="1" className="text-[var(--color-neutral-dark)] text-center md:text-xs">
            Kérastase Paris
          </Caption>
        </div>

        {/* Hero Image */}
        <div className="relative w-full shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden rounded-sm">
          <img
            src={heroImage}
            alt="Kérastase aesthetic"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 md:gap-7 items-start w-full">
          {/* Heading */}
          <div className="flex flex-col items-center justify-center w-full">
            <Title variant="h1" className="text-[var(--color-neutral-dark)] text-center md:text-[40px] lg:text-[44px] px-8 md:px-12">
              Discover your subculture
            </Title>
          </div>

          {/* Subtitle */}
          <div className="flex flex-col items-center justify-center w-full">
            <Body variant="1" className="text-[var(--color-neutral-gray)] text-center md:text-[17px] px-1 md:px-4">
              A curated journey to reveal the aesthetic you naturally resonate with.
            </Body>
          </div>
        </div>

        {/* Error Message (if any) */}
        {isError && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <p className="text-red-800 text-sm text-center">
              {loadingState.error.message}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="primary"
          className="w-full h-[52px] md:h-[56px] flex items-center justify-center"
          type="button"
          aria-label="Begin the experience"
          onClick={handleBeginExperience}
          disabled={isLoading}
        >
          {isLoading ? 'Creating your profile...' : 'Begin the experience'}
        </Button>
      </div>
    </main>
  );
};
