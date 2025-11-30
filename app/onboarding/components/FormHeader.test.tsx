import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormHeader } from './FormHeader';

describe('FormHeader Component', () => {
  const mockOnBack = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render progress indicator with correct step information', () => {
    render(<FormHeader currentStep={1} totalSteps={4} onBack={mockOnBack} />);

    // Should show the label
    const label = screen.getByText(/kérastase experience/i);
    expect(label).toBeInTheDocument();

    // Should show step count
    const stepCount = screen.getByText(/step 1 \/ 4/i);
    expect(stepCount).toBeInTheDocument();
  });

  it('should calculate progress percentage correctly', () => {
    const { container } = render(<FormHeader currentStep={1} totalSteps={4} onBack={mockOnBack} />);

    // Progress bar should be 25% wide (1/4)
    const progressBar = container.querySelector('[class*="bg-primary"]');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '25%' });
  });

  it('should render back button with arrow icon and text', () => {
    render(<FormHeader currentStep={1} totalSteps={4} onBack={mockOnBack} />);

    // Back button should be present
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<FormHeader currentStep={1} totalSteps={4} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should render with correct progress for step 2', () => {
    const { container } = render(<FormHeader currentStep={2} totalSteps={4} onBack={mockOnBack} />);

    // Step count should show 2/4
    const stepCount = screen.getByText(/step 2 \/ 4/i);
    expect(stepCount).toBeInTheDocument();

    // Progress bar should be 50% wide (2/4)
    const progressBar = container.querySelector('[class*="bg-primary"]');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<FormHeader currentStep={1} totalSteps={4} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back/i });

    // Tab to the button
    await user.tab();
    expect(backButton).toHaveFocus();

    // Press Enter to activate
    await user.keyboard('{Enter}');
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
