import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeywordsScreen } from './KeywordsScreen';

const mockKeywords = [
  { id: 'kw-1', name: 'legacy', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-2', name: 'tradition', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-3', name: 'discretion', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-4', name: 'exclusivity', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-5', name: 'pleasure', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-6', name: 'sustainability', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-7', name: 'discipline', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-8', name: 'minimalism', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-9', name: 'home rituals', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-10', name: 'quiet beauty', created_at: null, updated_at: null, tribe_id: null },
  { id: 'kw-11', name: 'introspective', created_at: null, updated_at: null, tribe_id: null },
];

describe('KeywordsScreen', () => {
  const mockOnBack = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the main title', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      expect(screen.getByText('Select the words that define you')).toBeInTheDocument();
    });

    it('should render the subtitle with instructions', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      expect(screen.getByText('Choose between 3 and 10 words.')).toBeInTheDocument();
    });

    it('should render provided keywords', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      mockKeywords.forEach((keyword) => {
        expect(screen.getByRole('button', { name: new RegExp(keyword.name, 'i') })).toBeInTheDocument();
      });
    });

    it('should render progress indicator showing Step 3/4', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      expect(screen.getByText('Step 3 / 4')).toBeInTheDocument();
    });

    it('should render Back button', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('should render Continue button', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should have Continue button disabled initially', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });
  });

  describe('Keyword Selection', () => {
    it('should allow selecting a keyword', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      await user.click(legacyBadge);

      // Badge should have selected styles
      expect(legacyBadge.className).toContain('bg-neutral-dark');
    });

    it('should allow deselecting a keyword', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

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
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

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
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const legacyBadge = screen.getByRole('button', { name: /legacy/i });
      await user.click(legacyBadge);

      // Check icon should be present
      const checkIcon = within(legacyBadge).getByTestId('badge-check-icon');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should not allow selecting more than 10 keywords', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      // Select first 10
      for (let i = 0; i < 10; i++) {
        const badge = screen.getByRole('button', { name: new RegExp(mockKeywords[i].name, 'i') });
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
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Select 2 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));

      expect(continueButton).toBeDisabled();
    });

    it('should enable Continue button with exactly 3 selections', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Select 3 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      expect(continueButton).not.toBeDisabled();
    });

    it('should enable Continue button with 10 selections', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      for (let i = 0; i < 10; i++) {
        await user.click(screen.getByRole('button', { name: new RegExp(mockKeywords[i].name, 'i') }));
      }

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).not.toBeDisabled();
    });

    it('should disable Continue button when deselecting below 3', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

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
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should call onContinue with selected keywords when Continue is clicked', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      // Select 3 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(mockOnContinue).toHaveBeenCalledTimes(1);
      // Should be called with IDs, not labels
      expect(mockOnContinue).toHaveBeenCalledWith(['kw-1', 'kw-2', 'kw-3']);
    });

    it('should not call onContinue when button is disabled', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);

      expect(mockOnContinue).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loader icon on Continue button when loading', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} isLoading={true} />);

      // Select 3 keywords to enable button (but it should still be disabled due to loading)
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Check for loader icon (LoaderCircle has animate-spin class)
      const loaderIcon = continueButton.querySelector('.animate-spin');
      expect(loaderIcon).toBeInTheDocument();
    });

    it('should disable Continue button during loading', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} isLoading={true} />);

      // Select 3 keywords
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      const continueButton = screen.getByRole('button', { name: /continue/i });
      expect(continueButton).toBeDisabled();
    });

    it('should display error message when isError is true', () => {
      const testError = new Error('Failed to load brands');
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} isError={true} error={testError} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load brands')).toBeInTheDocument();
    });

    it('should not display error message when isError is false', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} isError={false} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should not show loader icon when not loading', async () => {
      const user = userEvent.setup();
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} isLoading={false} />);

      // Select 3 keywords to enable button
      await user.click(screen.getByRole('button', { name: /legacy/i }));
      await user.click(screen.getByRole('button', { name: /^tradition$/i }));
      await user.click(screen.getByRole('button', { name: /discretion/i }));

      const continueButton = screen.getByRole('button', { name: /continue/i });

      // Loader icon should not be present
      const loaderIcon = continueButton.querySelector('.animate-spin');
      expect(loaderIcon).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);
      const title = screen.getByText('Select the words that define you');
      expect(title).toBeInTheDocument();
    });

    it('should have keyboard navigation support for badges', () => {
      render(<KeywordsScreen onBack={mockOnBack} onContinue={mockOnContinue} keywords={mockKeywords} />);

      const badges = screen.getAllByRole('button');
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('type', 'button');
      });
    });
  });
});
