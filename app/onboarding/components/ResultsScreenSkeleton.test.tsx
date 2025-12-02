import { render, screen } from '@testing-library/react';
import { ResultsScreenSkeleton } from './ResultsScreenSkeleton';

describe('ResultsScreenSkeleton', () => {
  it('should render skeleton layout structure', () => {
    render(<ResultsScreenSkeleton />);
    const container = screen.getByTestId('results-skeleton');
    expect(container).toBeInTheDocument();
  });

  it('should display title skeleton', () => {
    render(<ResultsScreenSkeleton />);
    const titleSkeleton = screen.getByTestId('skeleton-title');
    expect(titleSkeleton).toBeInTheDocument();
  });

  it('should display body text skeleton with 2 lines', () => {
    render(<ResultsScreenSkeleton />);
    const bodyLine1 = screen.getByTestId('skeleton-body-line-1');
    const bodyLine2 = screen.getByTestId('skeleton-body-line-2');
    expect(bodyLine1).toBeInTheDocument();
    expect(bodyLine2).toBeInTheDocument();
  });

  it('should display 3 subculture card skeletons', () => {
    render(<ResultsScreenSkeleton />);
    const card1 = screen.getByTestId('skeleton-card-1');
    const card2 = screen.getByTestId('skeleton-card-2');
    const card3 = screen.getByTestId('skeleton-card-3');
    expect(card1).toBeInTheDocument();
    expect(card2).toBeInTheDocument();
    expect(card3).toBeInTheDocument();
  });

  it('should have correct size hierarchy for card titles (h1 > h2 > h3)', () => {
    render(<ResultsScreenSkeleton />);

    const card1Title = screen.getByTestId('skeleton-card-1-title');
    const card2Title = screen.getByTestId('skeleton-card-2-title');
    const card3Title = screen.getByTestId('skeleton-card-3-title');

    // Check heights - h1 should be tallest, h3 shortest
    const card1Height = card1Title.style.height;
    const card2Height = card2Title.style.height;
    const card3Height = card3Title.style.height;

    expect(card1Height).toBeTruthy();
    expect(card2Height).toBeTruthy();
    expect(card3Height).toBeTruthy();

    // Verify hierarchy exists in classes
    expect(card1Title).toHaveClass('h-12'); // h1 equivalent
    expect(card2Title).toHaveClass('h-10'); // h2 equivalent
    expect(card3Title).toHaveClass('h-8'); // h3 equivalent
  });

  it('should have rank number skeleton in each card', () => {
    render(<ResultsScreenSkeleton />);

    const card1Rank = screen.getByTestId('skeleton-card-1-rank');
    const card2Rank = screen.getByTestId('skeleton-card-2-rank');
    const card3Rank = screen.getByTestId('skeleton-card-3-rank');

    expect(card1Rank).toBeInTheDocument();
    expect(card2Rank).toBeInTheDocument();
    expect(card3Rank).toBeInTheDocument();
  });

  it('should have percentage skeleton in each card', () => {
    render(<ResultsScreenSkeleton />);

    const card1Percentage = screen.getByTestId('skeleton-card-1-percentage');
    const card2Percentage = screen.getByTestId('skeleton-card-2-percentage');
    const card3Percentage = screen.getByTestId('skeleton-card-3-percentage');

    expect(card1Percentage).toBeInTheDocument();
    expect(card2Percentage).toBeInTheDocument();
    expect(card3Percentage).toBeInTheDocument();
  });

  it('should have progress bar skeleton in each card', () => {
    render(<ResultsScreenSkeleton />);

    const card1ProgressBar = screen.getByTestId('skeleton-card-1-progress');
    const card2ProgressBar = screen.getByTestId('skeleton-card-2-progress');
    const card3ProgressBar = screen.getByTestId('skeleton-card-3-progress');

    expect(card1ProgressBar).toBeInTheDocument();
    expect(card2ProgressBar).toBeInTheDocument();
    expect(card3ProgressBar).toBeInTheDocument();

    // Progress bars should have correct height (4px from original)
    expect(card1ProgressBar).toHaveClass('h-[4px]');
    expect(card2ProgressBar).toHaveClass('h-[4px]');
    expect(card3ProgressBar).toHaveClass('h-[4px]');
  });

  it('should display button skeleton at bottom', () => {
    render(<ResultsScreenSkeleton />);
    const buttonSkeleton = screen.getByTestId('skeleton-button');
    expect(buttonSkeleton).toBeInTheDocument();
    expect(buttonSkeleton).toHaveClass('h-[52px]'); // Match button height
  });

  it('should match ResultsScreen container classes', () => {
    render(<ResultsScreenSkeleton />);
    const container = screen.getByTestId('results-skeleton');

    // Check for container classes matching ResultsScreen
    expect(container).toHaveClass('bg-surface-light');
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('p-6');
  });

  it('should have proper responsive classes', () => {
    render(<ResultsScreenSkeleton />);
    const innerContainer = screen.getByTestId('results-skeleton-inner');

    // Check for responsive classes
    expect(innerContainer).toHaveClass('max-w-[345px]');
    expect(innerContainer).toHaveClass('md:max-w-4xl');
    expect(innerContainer).toHaveClass('gap-10');
    expect(innerContainer).toHaveClass('md:gap-12');
  });

  it('should have accessible loading label', () => {
    render(<ResultsScreenSkeleton />);
    const container = screen.getByTestId('results-skeleton');
    expect(container).toHaveAttribute('aria-busy', 'true');
    expect(container).toHaveAttribute('aria-label', 'Loading results');
  });
});
