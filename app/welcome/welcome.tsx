import type { FC } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '~/shared/components/Button/Button';
import { Body } from '~/shared/components/Typography/Body';
import { Caption } from '~/shared/components/Typography/Caption';
import { Title } from '~/shared/components/Typography/Title';
import heroImage from './Photo Ora.jpg';

export interface WelcomeProps {
  onBeginExperience?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
}

export const Welcome: FC<WelcomeProps> = ({ onBeginExperience, isLoading, isError, error }) => {
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
              {error?.message}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <Button
          variant="primary"
          className="w-full h-[52px] md:h-[56px] flex items-center justify-center gap-2"
          type="button"
          aria-label="Begin the experience"
          onClick={onBeginExperience}
          disabled={isLoading}
        >
          {isLoading && <LoaderCircle className="w-5 h-5 animate-spin" />}
          Begin the experience
        </Button>
      </div>
    </main>
  );
};
