import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MoodboardScreen } from './MoodboardScreen';
import { moodboardService } from '~/shared/services/moodboardService';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the moodboard service
jest.mock('~/shared/services/moodboardService');

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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display loading state while fetching moodboards', () => {
        // Mock a pending promise
        const mockedGetAll = jest.fn().mockImplementation(() => new Promise(() => { }));
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state on fetch failure', async () => {
        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('should render grid of moodboard cards on success', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
            { id: '2', name: 'Quiet Luxury', description: 'Test 2' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
            expect(screen.getByText('Quiet Luxury')).toBeInTheDocument();
        });
    });

    it('should highlight selected card when clicked', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
        });

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        // Check that the card is now marked as selected (aria-pressed="true")
        expect(card).toHaveAttribute('aria-pressed', 'true');
    });

    it('should disable Continue button when no moodboard selected', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
        });

        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).toBeDisabled();
    });

    it('should enable Continue button when moodboard is selected', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
        });

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        const continueButton = screen.getByRole('button', { name: /continue/i });
        expect(continueButton).not.toBeDisabled();
    });

    it('should call onContinue with moodboard ID when Continue clicked', async () => {
        const mockMoodboards = [
            { id: 'test-id-123', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
        });

        const card = screen.getByRole('button', { name: /select heritage heiress/i });
        fireEvent.click(card);

        const continueButton = screen.getByRole('button', { name: /continue/i });
        fireEvent.click(continueButton);

        expect(mockOnContinue).toHaveBeenCalledWith('test-id-123');
    });

    it('should call onBack when back button is clicked', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            expect(screen.getByText('Heritage Heiress')).toBeInTheDocument();
        });

        // FormHeader should have a back button
        const backButton = screen.getByRole('button', { name: /back/i });
        fireEvent.click(backButton);

        expect(mockOnBack).toHaveBeenCalled();
    });

    it('should render FormHeader with correct step (2/4)', async () => {
        const mockMoodboards = [
            { id: '1', name: 'Heritage Heiress', description: 'Test 1' },
        ];

        // @ts-expect-error - Mocking for tests
        const mockedGetAll = jest.fn().mockResolvedValue(mockMoodboards);
        (moodboardService.getAll as jest.Mock) = mockedGetAll;

        render(<MoodboardScreen onBack={mockOnBack} onContinue={mockOnContinue} />);

        await waitFor(() => {
            // Check for step indicator - looking for "2" and "4"
            expect(screen.getByText(/2/)).toBeInTheDocument();
            expect(screen.getByText(/4/)).toBeInTheDocument();
        });
    });
});
