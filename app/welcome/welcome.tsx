import type { FC } from 'react';
import heroImage from './hero-image.png';

export const Welcome: FC = () => {
  return (
    <main className="bg-[var(--color-surface-light)] flex items-center justify-center min-h-screen p-6 md:p-8 lg:p-12">
      <div className="flex flex-col gap-10 md:gap-12 lg:gap-14 items-center w-full max-w-[344.914px] md:max-w-md lg:max-w-lg">
        {/* Caption */}
        <div className="flex items-center justify-center w-full">
          <p className="font-[family-name:var(--font-inter)] font-semibold text-[length:var(--font-size-caption-1)] md:text-xs text-[var(--color-neutral-dark)] text-center uppercase tracking-[length:var(--letter-spacing-caption-wide)] leading-normal">
            Kérastase Paris
          </p>
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
            <h1 className="font-[family-name:var(--font-crimson)] font-normal text-[length:var(--font-size-title-h1)] md:text-[40px] lg:text-[44px] text-[var(--color-neutral-dark)] text-center leading-normal px-8 md:px-12">
              Discover your subculture
            </h1>
          </div>

          {/* Subtitle */}
          <div className="flex flex-col items-center justify-center w-full">
            <p className="font-[family-name:var(--font-inter)] font-normal text-[length:var(--font-size-body-1)] md:text-[17px] text-[var(--color-neutral-gray)] text-center leading-normal px-1 md:px-4">
              A curated journey to reveal the aesthetic you naturally resonate with.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="
            bg-[var(--color-neutral-dark)]
            hover:bg-opacity-90
            active:bg-opacity-80
            flex items-center justify-center
            h-[52px] md:h-[56px]
            w-full
            px-5 py-4
            rounded-lg
            overflow-hidden
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[var(--color-neutral-dark)] focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          type="button"
          aria-label="Begin the experience"
        >
          <span className="font-[family-name:var(--font-inter)] font-normal text-[length:var(--font-size-body-2)] md:text-base text-white text-center whitespace-nowrap">
            Begin the experience
          </span>
        </button>
      </div>
    </main>
  );
};
