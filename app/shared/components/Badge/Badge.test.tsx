import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Check } from 'lucide-react';
import { Badge } from './Badge';

describe('Badge', () => {
  describe('Basic Rendering', () => {
    it('should render with children text', () => {
      render(<Badge>Legacy</Badge>);
      expect(screen.getByRole('button')).toHaveTextContent('Legacy');
    });

    it('should apply custom className', () => {
      render(<Badge className="custom-class">Test</Badge>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('custom-class');
    });
  });

  describe('Selected State', () => {
    it('should apply selected styles when selected is true', () => {
      render(<Badge selected>Legacy</Badge>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-neutral-dark');
      expect(button.className).toContain('text-neutral-white');
    });

    it('should apply unselected styles when selected is false', () => {
      render(<Badge selected={false}>Legacy</Badge>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-transparent');
      expect(button.className).toContain('text-neutral-dark');
      expect(button.className).toContain('border-neutral-gray-200');
    });

    it('should render icon when selected and icon prop provided', () => {
      render(
        <Badge selected icon={<Check data-testid="check-icon" size={16} />}>
          Legacy
        </Badge>
      );
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should not render icon when not selected', () => {
      render(
        <Badge selected={false} icon={<Check data-testid="check-icon" size={16} />}>
          Legacy
        </Badge>
      );
      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });

    it('should not render icon when selected but no icon prop', () => {
      render(<Badge selected>Legacy</Badge>);
      const button = screen.getByRole('button');
      // Should only have text content
      expect(button.textContent).toBe('Legacy');
    });
  });

  describe('Interactive Behavior', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Badge onClick={handleClick}>Legacy</Badge>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be enabled when onClick is provided', () => {
      const handleClick = jest.fn();
      render(<Badge onClick={handleClick}>Legacy</Badge>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
      expect(button.className).toContain('cursor-pointer');
    });

    it('should be disabled when no onClick is provided', () => {
      render(<Badge>Legacy</Badge>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('cursor-default');
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<Badge>Legacy</Badge>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have type="button"', () => {
      render(<Badge>Legacy</Badge>);
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Selected State with Neutral Dark Background', () => {
    it('should use neutral-dark background when selected (not primary)', () => {
      render(<Badge selected>Legacy</Badge>);
      const button = screen.getByRole('button');

      // Should use neutral-dark, not primary
      expect(button.className).toContain('bg-neutral-dark');
      expect(button.className).not.toContain('bg-primary');
    });
  });
});
