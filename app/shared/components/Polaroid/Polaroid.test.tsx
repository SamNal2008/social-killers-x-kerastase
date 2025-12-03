import { render, screen } from '@testing-library/react';
import { Polaroid } from './Polaroid';

// Mock the current date for consistent testing
const MOCK_DATE = new Date('2025-12-03T10:00:00.000Z');

describe('Polaroid', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with image when imageSrc is provided', () => {
      render(
        <Polaroid
          imageSrc="https://example.com/image.jpg"
          imageAlt="Test image"
          title="Test Title"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
    });

    it('should render title text when no imageSrc is provided', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Placeholder Title"
        />
      );

      expect(screen.getByText('Placeholder Title')).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('should render default subtitle when not provided', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      expect(screen.getByText('Swipe to decide')).toBeInTheDocument();
    });

    it('should render custom subtitle when provided', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          subtitle="Tribes & Communities Day"
        />
      );

      expect(screen.getByText('Tribes & Communities Day')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          className="custom-class"
        />
      );

      const polaroidDiv = container.firstChild;
      expect(polaroidDiv).toHaveClass('custom-class');
    });
  });

  describe('Date Display (New Feature)', () => {
    it('should display current date in DD.MM.YY format', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // For 2025-12-03, expect "03.12.25"
      expect(screen.getByText('03.12.25')).toBeInTheDocument();
    });

    it('should display date with correct format for single-digit days', () => {
      jest.setSystemTime(new Date('2025-01-05T10:00:00.000Z'));

      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // For 2025-01-05, expect "05.01.25"
      expect(screen.getByText('05.01.25')).toBeInTheDocument();
    });

    it('should display date with correct format for single-digit months', () => {
      jest.setSystemTime(new Date('2025-09-15T10:00:00.000Z'));

      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // For 2025-09-15, expect "15.09.25"
      expect(screen.getByText('15.09.25')).toBeInTheDocument();
    });

    it('should display date with padded zeros for day and month', () => {
      jest.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));

      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // For 2025-01-01, expect "01.01.25"
      expect(screen.getByText('01.01.25')).toBeInTheDocument();
    });

    it('should use 2-digit year format', () => {
      jest.setSystemTime(new Date('2030-06-20T10:00:00.000Z'));

      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // For 2030-06-20, expect "20.06.30" (not "20.06.2030")
      expect(screen.getByText('20.06.30')).toBeInTheDocument();
    });

    it('should hide date when showDate is false', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          showDate={false}
        />
      );

      // Date should not be displayed
      expect(screen.queryByText('03.12.25')).not.toBeInTheDocument();
    });

    it('should show date by default (showDate defaults to true)', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      // Date should be displayed by default
      expect(screen.getByText('03.12.25')).toBeInTheDocument();
    });
  });

  describe('Counter Removal (Deprecated Feature)', () => {
    it('should NOT display counter even when currentItem and totalItems are provided', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          currentItem={1}
          totalItems={3}
        />
      );

      // Counter should no longer be displayed
      expect(screen.queryByText('1/3')).not.toBeInTheDocument();
    });

    it('should NOT display counter with different values', () => {
      render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          currentItem={2}
          totalItems={5}
        />
      );

      expect(screen.queryByText('2/5')).not.toBeInTheDocument();
    });

    it('should accept currentItem and totalItems props without breaking (backward compatibility)', () => {
      // Should not throw error even if props are still passed
      expect(() => {
        render(
          <Polaroid
            imageAlt="Test image"
            title="Test"
            currentItem={1}
            totalItems={3}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Layout and Styling', () => {
    it('should display subtitle and date in the same footer row', () => {
      const { container } = render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
          subtitle="Tribes & Communities Day"
        />
      );

      // Both subtitle and date should be in the footer
      expect(screen.getByText('Tribes & Communities Day')).toBeInTheDocument();
      expect(screen.getByText('03.12.25')).toBeInTheDocument();

      // They should be in a flex container with justify-between
      const footerDiv = container.querySelector('.flex.items-center.justify-between');
      expect(footerDiv).toBeInTheDocument();
    });

    it('should have responsive aspect ratio classes', () => {
      const { container } = render(
        <Polaroid
          imageAlt="Test image"
          title="Test"
        />
      );

      const polaroidDiv = container.firstChild as HTMLElement;

      // Should have max-width constraints for responsive design
      expect(polaroidDiv.className).toMatch(/max-w-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      render(
        <Polaroid
          imageSrc="https://example.com/image.jpg"
          imageAlt="A beautiful moodboard"
          title="Test"
        />
      );

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'A beautiful moodboard');
    });

    it('should render semantic HTML structure', () => {
      const { container } = render(
        <Polaroid
          imageSrc="https://example.com/image.jpg"
          imageAlt="Test image"
          title="Test"
          subtitle="Test subtitle"
        />
      );

      // Should have proper div structure
      expect(container.querySelector('.bg-neutral-white')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });
  });
});
