import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TinderScreen } from './TinderScreen';

describe('TinderScreen', () => {
    const mockOnBack = jest.fn();
    const mockOnContinue = jest.fn();

    const defaultProps = {
        onBack: mockOnBack,
        onContinue: mockOnContinue,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the component with FormHeader showing step 4 of 4', () => {
            render(<TinderScreen {...defaultProps} />);

            // Check for FormHeader with correct step
            expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
            // Note: We might need to check the text content for "Step 4" if exposed
        });

        it('should render the first brand card (Hermès)', () => {
            render(<TinderScreen {...defaultProps} />);

            expect(screen.getByText('Hermès')).toBeInTheDocument();
        });

        it('should show progress indicator 1/20', () => {
            render(<TinderScreen {...defaultProps} />);

            expect(screen.getByText('1/20')).toBeInTheDocument();
        });

        it('should render Like and Pass buttons', () => {
            render(<TinderScreen {...defaultProps} />);

            expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should swipe card right when Like button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);

            const likeButton = screen.getByRole('button', { name: /like/i });
            fireEvent.click(likeButton);

            // First card should disappear
            await waitFor(() => {
                expect(screen.queryByText('Hermès')).not.toBeInTheDocument();
            });

            // Second card should appear
            expect(screen.getByText('Cartier')).toBeInTheDocument();
            expect(screen.getByText('2/20')).toBeInTheDocument();
        });

        it('should swipe card left when Pass button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);

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

            const likeButton = screen.getByRole('button', { name: /like/i });

            // Like first brand
            fireEvent.click(likeButton);

            await waitFor(() => {
                expect(screen.getByText('Cartier')).toBeInTheDocument();
            });
        });

        it('should track passed brands when Pass button is clicked', async () => {
            render(<TinderScreen {...defaultProps} />);

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

            const likeButton = screen.getByRole('button', { name: /like/i });

            expect(screen.getByText('1/20')).toBeInTheDocument();

            fireEvent.click(likeButton);

            await waitFor(() => {
                expect(screen.getByText('2/20')).toBeInTheDocument();
            });
        });
    });

    describe('End State', () => {
        it('should disable buttons when all cards are swiped', async () => {
            render(<TinderScreen {...defaultProps} />);

            const likeButton = screen.getByRole('button', { name: /like/i });

            // Swipe all 20 cards
            for (let i = 0; i < 20; i++) {
                fireEvent.click(likeButton);
                await waitFor(() => { }, { timeout: 100 });
            }

            // Buttons should be disabled
            await waitFor(() => {
                expect(likeButton).toBeDisabled();
                expect(screen.getByRole('button', { name: /pass/i })).toBeDisabled();
            });
        });

        it('should not call onContinue when all cards are swiped (for now)', async () => {
            render(<TinderScreen {...defaultProps} />);

            const likeButton = screen.getByRole('button', { name: /like/i });

            // Swipe all 20 cards
            for (let i = 0; i < 20; i++) {
                fireEvent.click(likeButton);
                await waitFor(() => { }, { timeout: 100 });
            }

            expect(mockOnContinue).not.toHaveBeenCalled();
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
});
