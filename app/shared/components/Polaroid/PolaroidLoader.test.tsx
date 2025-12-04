import { render, screen } from '@testing-library/react';
import { PolaroidLoader } from './PolaroidLoader';

describe('PolaroidLoader', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      render(<PolaroidLoader imageNumber={1} />);
      expect(screen.getByTestId('polaroid-loader')).toBeInTheDocument();
    });

    it('should display generating text with image number', () => {
      render(<PolaroidLoader imageNumber={2} />);
      expect(screen.getByText(/generating image 2\/3/i)).toBeInTheDocument();
    });

    it('should display loading spinner', () => {
      render(<PolaroidLoader imageNumber={1} />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    it('should have aspect-[3/4] ratio to match Polaroid', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('aspect-[3/4]');
    });

    it('should have same max-width constraints as Polaroid', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('max-w-[343px]');
      expect(loader.className).toContain('md:max-w-[400px]');
      expect(loader.className).toContain('lg:max-w-[450px]');
    });

    it('should have white background like Polaroid', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('bg-neutral-white');
    });

    it('should have rounded corners and shadow like Polaroid', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('rounded-lg');
      expect(loader.className).toContain('shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]');
    });

    it('should have same padding as Polaroid', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('p-6');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label for screen readers', () => {
      render(<PolaroidLoader imageNumber={2} />);
      const loader = screen.getByTestId('polaroid-loader');
      expect(loader).toHaveAttribute('aria-label', 'Generating image 2 of 3');
    });

    it('should have role="status" for loading indicator', () => {
      render(<PolaroidLoader imageNumber={1} />);
      const loader = screen.getByTestId('polaroid-loader');
      expect(loader).toHaveAttribute('role', 'status');
    });

    it('should have aria-live="polite" for status updates', () => {
      render(<PolaroidLoader imageNumber={1} />);
      const loader = screen.getByTestId('polaroid-loader');
      expect(loader).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('variants', () => {
    it('should render for image 1/3', () => {
      render(<PolaroidLoader imageNumber={1} />);
      expect(screen.getByText(/generating image 1\/3/i)).toBeInTheDocument();
    });

    it('should render for image 2/3', () => {
      render(<PolaroidLoader imageNumber={2} />);
      expect(screen.getByText(/generating image 2\/3/i)).toBeInTheDocument();
    });

    it('should render for image 3/3', () => {
      render(<PolaroidLoader imageNumber={3} />);
      expect(screen.getByText(/generating image 3\/3/i)).toBeInTheDocument();
    });
  });

  describe('optional props', () => {
    it('should apply custom className', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} className="custom-class" />);
      const loader = container.firstChild as HTMLElement;
      expect(loader.className).toContain('custom-class');
    });

    it('should work without custom className', () => {
      const { container } = render(<PolaroidLoader imageNumber={1} />);
      const loader = container.firstChild as HTMLElement;
      expect(loader).toBeInTheDocument();
    });
  });
});
