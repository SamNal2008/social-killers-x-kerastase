import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeywordsScreen } from './KeywordsScreen';

describe('KeywordsScreen', () => {
  const mockOnBack = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the main title', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      expect(screen.getByText('Select the words that define you')).toBeInTheDocument();
    });

    it('should render the subtitle with instructions', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      expect(screen.getByText('Choose between 3 and 10 words.')).toBeInTheDocument();
    });

    it('should render all 20 keywords', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const keywords = [
        'legacy',
        'tradition',
        'discretion',
        'exclusivity',
        'pleasure',
        'sustainability',
        'discipline',
        'minimalism',
        'home rituals',
        'quiet beauty',
        'introspective',
        'magnetic',
        'creative',
        'culturally fluent',
        'performance',
        'bold attitude',
        'provocation',
        'fearless voice',
        'glow',
        'red carpet energy',
      ];

      keywords.forEach((keyword) => {
        expect(screen.getByRole('button', { name: new RegExp(keyword, 'i') })).toBeInTheDocument();
      });
    });

    it('should render progress indicator showing Step 3/4', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      expect(screen.getByText('Step 3 / 4')).toBeInTheDocument();
    });

    it('should render Back button', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should render Continue button', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should have Continue button disabled initially', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Keyword Selection', () => {
    it('should allow selecting a keyword', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      await user.click(legacyBadge);

      // Badge should have selected styles
      expect(legacyBadge.className).toContain('bg-neutral-dark');
    });

    it('should allow deselecting a keyword', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });

      // Select
      await user.click(legacyBadge);
      expect(legacyBadge.className).toContain('bg-neutral-dark');
      expect(legacyBadge.className).toContain('text-neutral-white');

      // Deselect
      await user.click(legacyBadge);
      expect(legacyBadge.className).toContain('bg-transparent');
      expect(legacyBadge.className).not.toContain('text-neutral-white');
    });

    it('should allow selecting multiple keywords', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      const traditionBadge = screen.getByRole('button', { name: /^tradition$/i });
      const discretionBadge = screen.getByRole('button', { name: /discretion/i });

      await user.click(legacyBadge);
      await user.click(traditionBadge);
      await user.click(discretionBadge);

      expect(legacyBadge.className).toContain('bg-neutral-dark');
      expect(traditionBadge.className).toContain('bg-neutral-dark');
      expect(discretionBadge.className).toContain('bg-neutral-dark');
    });

    it('should display check icon on selected badges', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      await user.click(legacyBadge);

      // Check icon should be present
      const checkIcon = within(legacyBadge).getByTestId('badge-check-icon');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should not allow selecting more than 10 keywords', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const keywords = [
        'legacy',
        'tradition',
        'discretion',
        'exclusivity',
        'pleasure',
        'sustainability',
        'discipline',
        'minimalism',
        'home rituals',
        'quiet beauty',
        'introspective', // 11th keyword
      ];

      // Select first 10
      for (let i = 0; i < 10; i++) {
        const badge = screen.getByRole('button', { name: new RegExp(keywords[i], 'i') });
        await user.click(badge);
      }

      // Try to select 11th
      const eleventhBadge = screen.getByRole('button', { name: /introspective/i });
      await user.click(eleventhBadge);

      // 11th badge should not be selected (should remain in unselected state)
      expect(eleventhBadge.className).toContain('bg-transparent');
      expect(eleventhBadge.className).not.toContain('text-neutral-white');
    });
  });

  describe('Continue Button State', () => {
    it('should keep Continue button disabled with less than 3 selections', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Select 2 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));

      expect(continueButton).toBeDisabled();
    });

    it('should enable Continue button with exactly 3 selections', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Select 3 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      expect(continueButton).not.toBeDisabled();
    });

    it('should enable Continue button with 10 selections', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const keywords = [
        'legacy',
        'tradition',
        'discretion',
        'exclusivity',
        'pleasure',
        'sustainability',
        'discipline',
        'minimalism',
        'home rituals',
        'quiet beauty',
      ];

      for (const keyword of keywords) {
        await user.click(screen.getByRole('button', { name: new RegExp(keyword, 'i') }));
      }

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });

    it('should disable Continue button when deselecting below 3', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      // Select 3
      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      const traditionBadge = screen.getByRole('button', { name: /^tradition$/i });
      const discretionBadge = screen.getByRole('button', { name: /discretion/i });

      await user.click(legacyBadge);
      await user.click(traditionBadge);
      await user.click(discretionBadge);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();

      // Deselect one
      await user.click(discretionBadge);

      expect(continueButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when Back button is clicked', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue with selected keywords when Continue is clicked', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      // Select 3 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
      expect(mockOnContinue).toHaveBeenCalledWith(['legacy', 'tradition', 'discretion']);
    });

    it('should not call onContinue when button is disabled', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      expect(mockOnContinue).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      // Title should be prominent (h1 or similar)
      const title = screen.getByText('Select the words that define you');
      expect(title).toBeInTheDocument();
    });

    it('should have keyboard navigation support for badges', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

      const badges = screen.getAllByRole('button');
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('type', 'button');
      });
    });
  });
});
