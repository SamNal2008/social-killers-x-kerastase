import { render, screen, fireEvent } from '@testing-library/react';
import { MoodboardScreen } from './MoodboardScreen';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
}));

describe('MoodboardScreen', () => {
    const mockOnBack = jest.fn();
    const mockOnContinue = jest.fn();
    const mockMoodboards = [
        {
            id: '1',
            name: 'Heritage Heiress',
            description: 'Test 1',
            image_url: 'test1.jpg',
            created_at: '2024-01-01',
            updated_at: null,
            subculture_id: null
        },
        {
            id: '2',
            name: 'Quiet Luxury',
            description: 'Test 2',
            image_url: 'test2.jpg',
            created_at: '2024-01-01',
            updated_at: null,
            subculture_id: null
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render grid of moodboard cards', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        // Check that moodboard cards are rendered by their aria-labels
        expect(screen.getByLabelText(/select heritage heiress moodboard/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/select quiet luxury moodboard/i)).toBeInTheDocument();

        // Check that magnifier buttons are rendered
        const magnifierButtons = screen.getAllByLabelText(/zoom into moodboard/i);
        expect(magnifierButtons).toHaveLength(2);
    });

    it('should highlight selected card when clicked', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        // Check that the card is now marked as selected (aria-pressed="true")
        expect(card).toHaveAttribute('aria-pressed', 'true');
    });

    it('should disable Continue button when no moodboard selected', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).toBeDisabled();
    });

    it('should enable Continue button when moodboard is selected', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).not.toBeDisabled();
    });

    it('should call onContinue with moodboard ID when Continue clicked', () => {
        const testMoodboards = [
            {
                id: 'test-id-123',
                name: 'Heritage Heiress',
                description: 'Test 1',
                image_url: 'test.jpg',
                created_at: '2024-01-01',
                updated_at: null,
                subculture_id: null
            },
        ];

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={testMoodboards} />);

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        const continueButton = screen.getByRole('button', { name: /continue/i });
        fireEvent.click(continueButton);

        expect(mockOnContinue).toHaveBeenCalledWith('test-id-123');
    });

    it('should call onBack when back button is clicked', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        // FormHeader should have a back button
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render FormHeader with correct step (2/4)', () => {
        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} moodboards={mockMoodboards} />);

        // Check for step indicator text "Step 2 / 4"
        expect(screen.getByText(/step\s+2\s+\/\s+4/i)).toBeInTheDocument();
    });
});
