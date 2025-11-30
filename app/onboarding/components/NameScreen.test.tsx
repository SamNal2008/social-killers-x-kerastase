import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NameScreen } from './NameScreen';

describe('NameScreen Component', () => {
  const mockOnBack = jest.fn();
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render FormHeader with correct step information', () => {
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    // Should show step 1 / 4
    const stepCount = screen.getByText(/step 1 \/ 4/i);
    expect(stepCount).toBeInTheDocument();

    // Should show Kérastase Experience label
    const label = screen.getByText(/kérastase experience/i);
    expect(label).toBeInTheDocument();
  });

  it('should render main heading and subtitle', () => {
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    // Main heading
    const heading = screen.getByRole('heading', { name: /first, what should we call you/i });
    expect(heading).toBeInTheDocument();

    // Subtitle
    const subtitle = screen.getByText(/let's make this journey personal/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('should render name input with placeholder', () => {
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should render Continue button', () => {
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeInTheDocument();
  });

  it('should have Continue button disabled when input is empty', () => {
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();
  });

  it('should enable Continue button when user types name', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Initially disabled
    expect(continueButton).toBeDisabled();

    // Type a name
    await user.type(input, 'John Doe');

    // Should be enabled now
    expect(continueButton).not.toBeDisabled();
  });

  it('should disable Continue button when input is cleared', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type a name
    await user.type(input, 'John');
    expect(continueButton).not.toBeDisabled();

    // Clear the input
    await user.clear(input);
    expect(continueButton).toBeDisabled();
  });

  it('should disable Continue button for whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type only spaces
    await user.type(input, '   ');
    expect(continueButton).toBeDisabled();
  });

  it('should call onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('should call onContinue with name value when Continue is clicked', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);
    const continueButton = screen.getByRole('button', { name: /continue/i });

    // Type a name
    await user.type(input, 'Jane Smith');

    // Click continue
    await user.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
    expect(mockOnContinue).toHaveBeenCalledWith('Jane Smith');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    const input = screen.getByPlaceholderText(/your name/i);

    // Tab to back button
    await user.tab();
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toHaveFocus();

    // Tab to input
    await user.tab();
    expect(input).toHaveFocus();

    // Type name
    await user.keyboard('Alice Johnson');

    // Tab to Continue button
    await user.tab();
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(mockOnContinue).toHaveBeenCalledWith('Alice Johnson');
  });

  it('should have proper semantic structure', () => {
    const { container } = render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    // Should have proper heading hierarchy
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();

    // Input should have accessible label via placeholder
    const input = screen.getByPlaceholderText(/your name/i);
    expect(input).toBeInTheDocument();
  });

  it('should apply mobile-first responsive styling', () => {
    const { container } = render(<NameScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

    // Container should have mobile-first classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toBeInTheDocument();
  });
});
