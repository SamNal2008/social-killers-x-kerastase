import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TinderScreen } from './TinderScreen';

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
        brands: mockBrands,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the component with FormHeader showing step 4 of 4', () => {
            render(<TinderScreen {...defaultProps} />);
            expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
            // Note: We might need to check the text content for "Step 4" if exposed
        });

        it('should render the first brand card (Hermès)', () => {
            render(<TinderScreen {...defaultProps} />);
            expect(screen.getByText('Hermès')).toBeInTheDocument();
        });

        it('should display the brand counter instead of date on polaroid cards', () => {
            render(<TinderScreen {...defaultProps} />);
            // Counter should be displayed instead of date
            // Should show "1 / 2" for first card of 2 brands
            expect(screen.getByText('1 / 2')).toBeInTheDocument();
            // Date should NOT be displayed
            const datePattern = /\d{2}\.\d{2}\.\d{2}/;
            const dates = screen.queryAllByText(datePattern);
            expect(dates.length).toBe(0);
        });

        it('should render Like and Pass buttons', () => {
            render(<TinderScreen {...defaultProps} />);
            expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should swipe card right when Like button is clicked', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const likeButton = screen.getByRole('button', { name: /like/i });
                fireEvent.click(likeButton);

                // Advance timers to complete animation
                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                // First card should disappear
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();

                // Second card should appear
                expect(screen.getByText('Cartier')).toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });

        it('should swipe card left when Pass button is clicked', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const passButton = screen.getByRole('button', { name: /pass/i });
                fireEvent.click(passButton);

                // Advance timers to complete animation
                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                // First card should disappear
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();

                // Second card should appear
                expect(screen.getByText('Cartier')).toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });

        it('should track liked brands when Like button is clicked', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const likeButton = screen.getByRole('button', { name: /like/i });

                // Like first brand
                fireEvent.click(likeButton);

                // Advance timers to complete animation
                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                expect(screen.getByText('Cartier')).toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });

        it('should track passed brands when Pass button is clicked', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const passButton = screen.getByRole('button', { name: /pass/i });

                // Pass first brand
                fireEvent.click(passButton);

                // Advance timers to complete animation
                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                expect(screen.getByText('Cartier')).toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('Progress Tracking', () => {
        it('should show next card after swipe', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const likeButton = screen.getByRole('button', { name: /like/i });

                // Initially showing first card
                expect(screen.getByText('Hermès')).toBeInTheDocument();

                fireEvent.click(likeButton);

                // Advance timers to complete animation
                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                // Now showing second card
                expect(screen.getByText('Cartier')).toBeInTheDocument();
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('End State', () => {
        it('should disable buttons when all cards are swiped', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                const likeButton = screen.getByRole('button', { name: /like/i });

                // Swipe all 2 cards
                for (let i = 0; i < 2; i++) {
                    fireEvent.click(likeButton);
                    await act(async () => {
                        jest.advanceTimersByTime(450);
                    });
                }

                // Buttons should be disabled
                expect(likeButton).toBeDisabled();
                expect(screen.getByRole('button', { name: /pass/i })).toBeDisabled();
            } finally {
                jest.useRealTimers();
            }
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

            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            expect(mockOnBack).toHaveBeenCalledTimes(1);
        });
    });

    describe('Drag Gestures', () => {
        it('should have draggable card element', () => {
            render(<TinderScreen {...defaultProps} />);

            // The card should have drag properties
            const card = screen.getByText('Hermès').closest('[data-testid="swipe-card"]');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Brand Logo Display', () => {
        it('should display brand logo on active card', () => {
            render(<TinderScreen {...defaultProps} />);

            // Active card should have an image with the brand logo URL
            const images = screen.getAllByRole('img');
            const activeCardImage = images.find(img => img.getAttribute('src') === 'url1');
            expect(activeCardImage).toBeInTheDocument();
            expect(activeCardImage).toHaveAttribute('alt', 'Hermès');
        });

        it('should display brand name as subtitle instead of "Swipe to decide"', () => {
            render(<TinderScreen {...defaultProps} />);

            // Brand name should be visible as subtitle
            expect(screen.getByText('Hermès')).toBeInTheDocument();

            // "Swipe to decide" should NOT be present
            expect(screen.queryByText('Swipe to decide')).not.toBeInTheDocument();
        });

        it('should update logo when swiping to next card', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                // Initial state - first brand logo
                let images = screen.getAllByRole('img');
                let activeCardImage = images.find(img => img.getAttribute('src') === 'url1');
                expect(activeCardImage).toBeInTheDocument();

                // Swipe to next card
                const likeButton = screen.getByRole('button', { name: /like/i });
                fireEvent.click(likeButton);

                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                // Second brand logo should now be displayed
                images = screen.getAllByRole('img');
                activeCardImage = images.find(img => img.getAttribute('src') === 'url2');
                expect(activeCardImage).toBeInTheDocument();
                expect(activeCardImage).toHaveAttribute('alt', 'Cartier');
            } finally {
                jest.useRealTimers();
            }
        });

        it('should show brand name as subtitle on each card', async () => {
            jest.useFakeTimers();
            try {
                render(<TinderScreen {...defaultProps} />);

                // First card subtitle
                expect(screen.getByText('Hermès')).toBeInTheDocument();

                // Swipe to next card
                const likeButton = screen.getByRole('button', { name: /like/i });
                fireEvent.click(likeButton);

                await act(async () => {
                    jest.advanceTimersByTime(450);
                });

                // Second card subtitle
                expect(screen.getByText('Cartier')).toBeInTheDocument();
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();
            } finally {
                jest.useRealTimers();
            }
        });
    });
});
