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

    it('should display loading state initially', () => {
        (resultsService.fetchUserResult as jest.Mock).mockImplementation(
            () => new Promise(() => { })
        );

        render(<ResultsScreen userResultId="test-123" />);

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display user results when loaded successfully', async () => {
        const mockData = {
            userResult: {
                id: 'result-123',
                userId: 'user-456',
                dominantTribeId: 'tribe-789',
                dominantTribeName: 'Minimalist',
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
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Minimalist' })).toBeInTheDocument();
        });

        expect(screen.getByText('45.5%')).toBeInTheDocument();
        expect(screen.getAllByText('Minimalist')).toHaveLength(2); // Once in heading, once in list
        expect(screen.getByText('Maximalist')).toBeInTheDocument();
        expect(screen.getByText('30.2%')).toBeInTheDocument();
        expect(screen.getByText('Eclectic')).toBeInTheDocument();
        expect(screen.getByText('24.3%')).toBeInTheDocument();
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
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [],
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
                createdAt: '2025-12-01T00:00:00Z',
            },
            tribePercentages: [
                {
                    tribeId: 'tribe-789',
                    tribeName: 'Minimalist',
                    percentage: 45.5,
                },
            ],
        };

        (resultsService.fetchUserResult as jest.Mock).mockResolvedValue(mockData);

        render(<ResultsScreen userResultId="test-123" />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Minimalist' })).toBeInTheDocument();
        });

        const deepDiveButton = screen.getByRole('button', { name: /let's deep dive/i });
        await userEvent.click(deepDiveButton);

        expect(mockNavigate).toHaveBeenCalledWith('/details?userResultId=test-123');
    });
});
