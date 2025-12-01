import { render, screen, fireEvent } from '@testing-library/react';
import { MoodboardCard } from './MoodboardCard';
import { describe, it, expect, jest } from '@jest/globals';

describe('MoodboardCard', () => {
    const mockMoodboard = {
        id: '1',
        name: 'Test Moodboard',
        description: 'Test Description',
        image_url: 'https://example.com/test-image.jpg',
    };
    const mockOnClick = jest.fn();

    it('should render moodboard name', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        expect(screen.getByText('Test Moodboard')).toBeInTheDocument();
    });

    it('should render moodboard description', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should call onClick with moodboard ID when clicked', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={false}
                onClick={mockOnClick}
            />
        );

        fireEvent.click(screen.getByRole('button'));
        expect(mockOnClick).toHaveBeenCalledWith('1');
    });

    it('should apply highlight styles when selected', () => {
        render(
            <MoodboardCard
                moodboard={mockMoodboard}
                isSelected={true}
                onClick={mockOnClick}
            />
        );

        const card = screen.getByRole('button');
        // We'll check for the border class or style
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

        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('aria-pressed', 'true');
        expect(card).toHaveAttribute('aria-label', 'Select Test Moodboard');
    });
});
