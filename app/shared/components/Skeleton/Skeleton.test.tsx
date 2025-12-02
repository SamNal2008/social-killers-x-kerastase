import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('should render with default props', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom width as string', () => {
    render(<Skeleton width="200px" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should apply custom width as number', () => {
    render(<Skeleton width={150} data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '150px' });
  });

  it('should apply custom height as string', () => {
    render(<Skeleton height="3rem" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '3rem' });
  });

  it('should apply custom height as number', () => {
    render(<Skeleton height={40} data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '40px' });
  });

  it('should apply rounded prop correctly', () => {
    const { rerender } = render(<Skeleton rounded="none" data-testid="skeleton" />);
    let skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-none');

    rerender(<Skeleton rounded="sm" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-sm');

    rerender(<Skeleton rounded="md" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-md');

    rerender(<Skeleton rounded="lg" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-lg');

    rerender(<Skeleton rounded="full" data-testid="skeleton" />);
    skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('should merge custom className with default classes', () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
    expect(skeleton).toHaveClass('bg-gray-200'); // Default class
  });

  it('should use shimmer animation by default', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-shimmer');
  });

  it('should support pulse animation', () => {
    render(<Skeleton animation="pulse" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).not.toHaveClass('animate-shimmer');
  });

  it('should have accessible loading label', () => {
    render(<Skeleton />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading');
  });

  it('should handle percentage-based dimensions', () => {
    render(<Skeleton width="100%" height="50%" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100%', height: '50%' });
  });

  it('should apply default dimensions when not specified', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100%', height: '1rem' });
  });
});
