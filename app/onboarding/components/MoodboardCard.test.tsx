import { render, screen, fireEvent } from '@testing-library/react';
import { MoodboardCard } from './MoodboardCard';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('MoodboardCard', () => {
    const mockMoodboard = {
        id: '1',
        name: 'Test Moodboard',
        description: 'Test Description',
        image_url: 'https://example.com/test-image.jpg',
    };
    const mockOnClick = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should NOT render moodboard name', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        expect(screen.queryByText('Test Moodboard')).not.toBeInTheDocument();
    });

    it('should NOT render moodboard description', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });

    it('should render magnifier button', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        const magnifierButton = screen.getByLabelText(/zoom into moodboard/i);
        expect(magnifierButton).toBeInTheDocument();
    });

    it('should have proper touch target size for magnifier button (44x44px)', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        const magnifierButton = screen.getByLabelText(/zoom into moodboard/i);
        expect(magnifierButton.className).toContain('w-11');
        expect(magnifierButton.className).toContain('h-11');
    });

    it('should call onClick with moodboard ID when card (not magnifier) is clicked', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );

        const card = screen.getByLabelText(/select.*moodboard/i);
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith('1');
    });

    it('should NOT call onClick when magnifier button is clicked', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );

        const magnifierButton = screen.getByLabelText(/zoom into moodboard/i);
        fireEvent.click(magnifierButton);
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should open zoom modal when magnifier is clicked', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );

        const magnifierButton = screen.getByLabelText(/zoom into moodboard/i);
        fireEvent.click(magnifierButton);

        // Modal should appear
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
    });

    it('should display correct image in zoom modal', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );

        const magnifierButton = screen.getByLabelText(/zoom into moodboard/i);
        fireEvent.click(magnifierButton);

        const modalImage = screen.getByRole('dialog').querySelector('img');
        expect(modalImage).toHaveAttribute('src', mockMoodboard.image_url);
    });

    it('should apply highlight styles when selected', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={true}
                onClick={mockOnClick}
            />
        );

        const card = screen.getByLabelText(/select.*moodboard/i);
        expect(card.className).toContain('border-[#C9A961]');
    });

    it('should have proper accessibility attributes', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={true}
                onClick={mockOnClick}
            />
        );

        const card = screen.getByLabelText(/select.*moodboard/i);
        expect(card).toHaveAttribute('aria-pressed', 'true');
    });
});
