import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResultsScreen } from './ResultsScreen';
import { resultsService } from '../services/resultsService';

jest.mock('../services/resultsService');
jest.mock('react-router', () => ({
    useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe('ResultsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const { useNavigate } = require('react-router');
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    it('should show ResultsScreenSkeleton when loading', () => {
        (resultsService.fetchUserResult as jest.Mock).mockImplementation(
            () => new Promise(() => { })
        );

        render(<ResultsScreen userResultId="test-123" />);

        const skeleton = screen.getByTestId('results-skeleton');
        expect(skeleton).toBeInTheDocument();
        expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('should display skeleton for at least 500ms even on fast load', async () => {
        jest.useFakeTimers();

        // Fast load - resolves in 100ms
        (resultsService.fetchUserResult as jest.Mock).mockImplementation(
            () => new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        userResult: {
                            id: 'result-123',
                            userId: 'user-456',
                            dominantTribeId: 'tribe-789',
                            dominantTribeName: 'Minimalist',
                            dominantSubcultureId: 'subculture-1',
                            dominantSubcultureName: 'Legacist',
                            createdAt: '2025-12-01T00:00:00Z',
                        },
                        tribePercentages: [],
                        subculturePercentages: [{
                            subcultureId: 'subculture-1',
                            subcultureName: 'Legacist',
                            percentage: 80,
                        }],
                    });
                }, 100);
            })
        );

        render(<ResultsScreen userResultId="test-123" />);

        // Should show skeleton initially
        expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();

        // Fast forward 100ms - data loaded but skeleton should still show
        jest.advanceTimersByTime(100);
        await waitFor(() => {
            expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();
        });

        // Fast forward remaining time to reach 500ms minimum
        jest.advanceTimersByTime(400);

        await waitFor(() => {
            expect(screen.queryByTestId('results-skeleton')).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it('should replace skeleton with real content after data loads', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [],
            subculturePercentages: [{
                subcultureId: 'subculture-1',
                subcultureName: 'Legacist',
                percentage: 80,
            }],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        // Initially shows skeleton
        expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();

        // Wait for real content
        await waitFor(() => {
            expect(screen.queryByTestId('results-skeleton')).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });
    });

    it('should not show skeleton when error occurs', async () => {
        (resultsService.fetchUserResult as jest.Mock).mockRejectedValue(
            new Error('Failed to fetch results')
        );

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.queryByTestId('results-skeleton')).not.toBeInTheDocument();
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('should handle slow data fetch correctly (> 500ms)', async () => {
        jest.useFakeTimers();

        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [],
            subculturePercentages: [{
                subcultureId: 'subculture-1',
                subcultureName: 'Legacist',
                percentage: 80,
            }],
        };

        // Slow load - resolves in 1000ms
        (resultsService.fetchUserResult as jest.Mock).mockImplementation(
            () => new Promise((resolve) => {
                setTimeout(() => resolve(mockData), 1000);
            })
        );

        render(<ResultsScreen userResultId="test-123" />);

        // Skeleton should show during entire loading period
        expect(screen.getByTestId('results-skeleton')).toBeInTheDocument();

        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(screen.queryByTestId('results-skeleton')).not.toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });

        jest.useRealTimers();
    });

    it('should have skeleton layout matching real content layout', () => {
        (resultsService.fetchUserResult as jest.Mock).mockImplementation(
            () => new Promise(() => { })
        );

        render(<ResultsScreen userResultId="test-123" />);

        const skeleton = screen.getByTestId('results-skeleton');

        // Check container classes match
        expect(skeleton).toHaveClass('bg-surface-light');
        expect(skeleton).toHaveClass('min-h-screen');

        // Check inner container
        const innerContainer = screen.getByTestId('results-skeleton-inner');
        expect(innerContainer).toHaveClass('max-w-[345px]');
        expect(innerContainer).toHaveClass('md:max-w-4xl');
    });

    it('should display user results when loaded successfully', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [
                {
                    tribeId: 'tribe-789',
                    tribeName: 'Minimalist',
                    percentage: 45.5,
                },
                {
                    tribeId: 'tribe-abc',
                    tribeName: 'Maximalist',
                    percentage: 30.2,
                },
                {
                    tribeId: 'tribe-def',
                    tribeName: 'Eclectic',
                    percentage: 24.3,
                },
            ],
            subculturePercentages: [
                {
                    subcultureId: 'subculture-1',
                    subcultureName: 'Legacist',
                    percentage: 80,
                },
                {
                    subcultureId: 'subculture-2',
                    subcultureName: 'Mystics',
                    percentage: 70,
                },
                {
                    subcultureId: 'subculture-3',
                    subcultureName: 'Curators',
                    percentage: 59,
                },
            ],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });

        expect(screen.getByText('Legacist')).toBeInTheDocument();
        expect(screen.getByText('80% Match')).toBeInTheDocument();
        expect(screen.getByText('Mystics')).toBeInTheDocument();
        expect(screen.getByText('70% Match')).toBeInTheDocument();
        expect(screen.getByText('Curators')).toBeInTheDocument();
        expect(screen.getByText('59% Match')).toBeInTheDocument();
    });

    it('should display error state when fetch fails', async () => {
        (resultsService.fetchUserResult as jest.Mock).mockRejectedValue(
            new Error('Failed to fetch results')
        );

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByText(/error/i)).toBeInTheDocument();
        });
    });

    it('should display progress indicator showing step 4 of 4', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [],
            subculturePercentages: [],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByText(/step 4 \/ 4/i)).toBeInTheDocument();
        });
    });

    it('should navigate to details page when "Let\'s deep dive" button is clicked', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [
                {
                    tribeId: 'tribe-789',
                    tribeName: 'Minimalist',
                    percentage: 45.5,
                },
            ],
            subculturePercentages: [
                {
                    subcultureId: 'subculture-1',
                    subcultureName: 'Legacist',
                    percentage: 80,
                },
            ],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });

        const deepDiveButton = screen.getByRole('button', { name: /let's deep dive/i });
        await userEvent.click(deepDiveButton);

        expect(mockNavigate).toHaveBeenCalledWith('/details?userResultId=test-123');
    });

    it('should show loading spinner in button when "Let\'s deep dive" is clicked', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
                dominantSubcultureId: 'subculture-1',
                dominantSubcultureName: 'Legacist',
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [],
            subculturePercentages: [
                {
                    subcultureId: 'subculture-1',
                    subcultureName: 'Legacist',
                    percentage: 80,
                },
            ],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Your subculture matches' })).toBeInTheDocument();
        });

        const deepDiveButton = screen.getByRole('button', { name: /let's deep dive/i });

        // Click the button
        await userEvent.click(deepDiveButton);

        // Button should be disabled after click
        expect(deepDiveButton).toBeDisabled();
    });
});
