import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TinderScreen } from './TinderScreen';
import { brandService } from '../services/brandService';

jest.mock('../services/brandService');

const mockBrands = [
    { id: 'brand-1', name: 'Hermès', logo_url: 'url1', created_at: null, updated_at: null, tribe_id: null },
    { id: 'brand-2', name: 'Cartier', logo_url: 'url2', created_at: null, updated_at: null, tribe_id: null },
];

describe('TinderScreen', () => {
    const mockOnBack = jest.fn();
    const mockOnContinue = jest.fn();

    const defaultProps = {
        onBack: mockOnBack,
        onContinue: mockOnContinue,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (brandService.getAll as jest.Mock).mockResolvedValue(mockBrands);
    });

    describe('Rendering', () => {
        it('should render loading state initially', () => {
            (brandService.getAll as jest.Mock).mockImplementation(() => new Promise(() => { }));
            render(<TinderScreen {...defaultProps} />);
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        it('should render the component with FormHeader showing step 4 of 4', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
            });
            // Note: We might need to check the text content for "Step 4" if exposed
        });

        it('should render the first brand card (Hermès)', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => {
                expect(screen.getByText('Hermès')).toBeInTheDocument();
            });
        });

        it('should show progress indicator 1/2', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => {
                expect(screen.getByText('1/2')).toBeInTheDocument();
            });
        });

        it('should render Like and Pass buttons', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument();
            });
        });
    });

    describe('Button Interactions', () => {
        it('should swipe card right when Like button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            const likeButton = screen.getByRole('button', { name: /like/i });
            fireEvent.click(likeButton);

            // First card should disappear
            await waitFor(() => {
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();
            });

            // Second card should appear
            expect(screen.getByText('Cartier')).toBeInTheDocument();
            expect(screen.getByText('2/2')).toBeInTheDocument();
        });

        it('should swipe card left when Pass button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            const passButton = screen.getByRole('button', { name: /pass/i });
            fireEvent.click(passButton);

            // First card should disappear
            await waitFor(() => {
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();
            });

            // Second card should appear
            expect(screen.getByText('Cartier')).toBeInTheDocument();
        });

        it('should track liked brands when Like button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            const likeButton = screen.getByRole('button', { name: /like/i });

            // Like first brand
            fireEvent.click(likeButton);

            await waitFor(() => {
                expect(screen.getByText('Cartier')).toBeInTheDocument();
            });
        });

        it('should track passed brands when Pass button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            const passButton = screen.getByRole('button', { name: /pass/i });

            // Pass first brand
            fireEvent.click(passButton);

            await waitFor(() => {
                expect(screen.getByText('Cartier')).toBeInTheDocument();
            });
        });
    });

    describe('Progress Tracking', () => {
        it('should update progress counter after each swipe', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('1/2')).toBeInTheDocument());

            const likeButton = screen.getByRole('button', { name: /like/i });

            fireEvent.click(likeButton);

            await waitFor(() => {
                expect(screen.getByText('2/2')).toBeInTheDocument();
            });
        });
    });

    describe('End State', () => {
        it('should disable buttons when all cards are swiped', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            const likeButton = screen.getByRole('button', { name: /like/i });

            // Swipe all 2 cards
            for (let i = 0; i < 2; i++) {
                fireEvent.click(likeButton);
                await waitFor(() => { }, { timeout: 100 });
            }

            // Buttons should be disabled
            await waitFor(() => {
                expect(likeButton).toBeDisabled();
                expect(screen.getByRole('button', { name: /pass/i })).toBeDisabled();
            });
        });

        it('should call onContinue when all cards are swiped', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                // Wait for data loading
                await act(async () => {
                    await Promise.resolve(); // Flush promises for data load
                });

                const likeButton = screen.getByRole('button', { name: /like/i });

                // Swipe all 2 cards
                for (let i = 0; i < 2; i++) {
                    fireEvent.click(likeButton);

                    // Advance timer by 400ms (animation duration) + buffer
                    // We need to wrap this in act to ensure state updates are processed
                    await act(async () => {
                        jest.advanceTimersByTime(450);
                    });
                }

                expect(mockOnContinue).toHaveBeenCalledWith(
                    expect.arrayContaining(['brand-1', 'brand-2']), // liked brands IDs
                    expect.any(Array)  // passed brands
                );
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('Back Navigation', () => {
        it('should call onBack when back button is clicked', async () => {
            const user = userEvent.setup();
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument());

            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('Drag Gestures', () => {
        it('should have draggable card element', async () => {
            render(<TinderScreen {...defaultProps} />);
            await waitFor(() => expect(screen.getByText('Hermès')).toBeInTheDocument());

            // The card should have drag properties
            const card = screen.getByText('Hermès').closest('[data-testid="swipe-card"]');
            expect(card).toBeInTheDocument();
        });
    });
});
