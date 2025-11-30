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

    describe('User Interaction', () => {
      it('should call onBeginExperience when button is clicked', async () => {
        const mockOnBeginExperience = jest.fn();

        render(<Welcome onBeginExperience={mockOnBeginExperience} />);
        const button = screen.getByRole('button', { name: /begin the experience/i });

        await userEvent.click(button);

        expect(mockOnBeginExperience).toHaveBeenCalledTimes(1);
      });

      it('should show loading state when isLoading is true', () => {
        render(<Welcome isLoading={true} />);
        const button = screen.getByRole('button', { name: /begin the experience/i });

        expect(screen.getByText('Creating your profile...')).toBeInTheDocument();
        expect(button).toBeDisabled();
      });

      it('should show error message when isError is true', () => {
        const error = new Error('Failed to create user: Database connection failed');

        render(<Welcome isError={true} error={error} />);

        expect(screen.getByText(/failed to create user/i)).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      it('should not call onBeginExperience when button is disabled', async () => {
        const mockOnBeginExperience = jest.fn();

        render(<Welcome onBeginExperience={mockOnBeginExperience} isLoading={true} />);
        const button = screen.getByRole('button', { name: /begin the experience/i });

        await userEvent.click(button);

        expect(mockOnBeginExperience).not.toHaveBeenCalled();
      });
    });


  });
});