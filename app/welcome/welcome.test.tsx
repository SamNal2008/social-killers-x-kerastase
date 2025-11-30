import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Welcome } from './welcome';
import { userService } from '~/shared/services/userService';
import type { Tables } from '~/shared/types/database.types';

type User = Tables<'users'>;

// Mock the userService
jest.mock('~/shared/services/userService');

describe('Welcome Component', () => {
  it('should render the Kérastase brand caption', () => {
    render(<Welcome />);
    const caption = screen.getByText(/kérastase paris/i);
    expect(caption).toBeInTheDocument();
  });

  it('should render the hero image with correct alt text', () => {
    render(<Welcome />);
    const heroImage = screen.getByAltText(/kérastase aesthetic/i);
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src');
  });

  it('should render the main heading', () => {
    render(<Welcome />);
    const heading = screen.getByRole('heading', { name: /discover your subculture/i });
    expect(heading).toBeInTheDocument();
  });

  it('should render the subtitle text', () => {
    render(<Welcome />);
    const subtitle = screen.getByText(/a curated journey to reveal the aesthetic you naturally resonate with/i);
    expect(subtitle).toBeInTheDocument();
  });

  it('should render the CTA button with correct text', () => {
    render(<Welcome />);
    const ctaButton = screen.getByRole('button', { name: /begin the experience/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should have proper semantic structure for accessibility', () => {
    render(<Welcome />);

    // Should have a main landmark
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();

    // Button should be keyboard accessible (implicit with role="button")
    const ctaButton = screen.getByRole('button', { name: /begin the experience/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should apply mobile-first responsive classes', () => {
    const { container } = render(<Welcome />);

    // The container should have mobile-first padding
    const mainContainer = container.querySelector('main');
    expect(mainContainer).toBeInTheDocument();
  });

  describe('User Creation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call userService.create when Begin button is clicked', async () => {
      const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      (userService.create as jest.Mock).mockResolvedValue(mockUser);

      render(<Welcome />);
      const button = screen.getByRole('button', { name: /begin the experience/i });

      await userEvent.click(button);

      await waitFor(() => {
        expect(userService.create).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state when creating user', async () => {
      (userService.create as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<Welcome />);
      const button = screen.getByRole('button', { name: /begin the experience/i });

      await userEvent.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();
    });

    it('should not create duplicate users on multiple clicks', async () => {
      const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Guest-1701388800000',
        connection_date: '2024-12-01T00:00:00.000Z',
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: '2024-12-01T00:00:00.000Z',
      };

      (userService.create as jest.Mock).mockResolvedValue(mockUser);

      render(<Welcome />);
      const button = screen.getByRole('button', { name: /begin the experience/i });

      // Click multiple times rapidly
      const clickPromise = userEvent.click(button);
      userEvent.click(button); // These should be ignored
      userEvent.click(button); // These should be ignored

      await clickPromise;

      await waitFor(() => {
        expect(userService.create).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle error when user creation fails', async () => {
      (userService.create as jest.Mock).mockRejectedValue(
        new Error('Failed to create user: Database connection failed')
      );

      render(<Welcome />);
      const button = screen.getByRole('button', { name: /begin the experience/i });

      await userEvent.click(button);

      await waitFor(() => {
        // Error message should be displayed
        expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
      });
    });

    it('should call onBeginExperience when CTA button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnBeginExperience = jest.fn();

      render(<Welcome onBeginExperience={mockOnBeginExperience} />);

      const ctaButton = screen.getByRole('button', { name: /begin the experience/i });
      await user.click(ctaButton);

      expect(mockOnBeginExperience).toHaveBeenCalledTimes(1);
    });
  });
});
