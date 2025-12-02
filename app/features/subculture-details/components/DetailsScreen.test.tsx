import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailsScreen } from './DetailsScreen';
import { tribeService } from '../services/tribeService';

jest.mock('../services/tribeService');
jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

describe('DetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useNavigate } = require('react-router');
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('should display tribe name when loaded', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Heritage Heiress',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion, favoring quality over volume.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Heritage Heiress' })).toBeInTheDocument();
    });
  });

  it('should display tribe description when loaded', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Heritage Heiress',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion, favoring quality over volume.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/appreciate beauty in discretion/i)).toBeInTheDocument();
    });
  });

  it('should display "Generate my AI moodboard" button', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Quiet Luxury',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate my ai moodboard/i })).toBeInTheDocument();
    });
  });

  it('should display error state on fetch failure', async () => {
    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch tribe')
    );

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should have back button that navigates to results', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Quiet Luxury',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Quiet Luxury' })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results?userResultId=test-123');
  });

  it('should display "YOUR KÉRASTASE TRIBE" header', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Heritage Heiress',
      subtitle: 'You make timeless elegance your own',
      description: 'Understated refinement is your signature.',
      dos: ['Choose quality over quantity', 'Invest in timeless pieces'],
      donts: ['Follow every trend', 'Compromise on craftsmanship'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/your kérastase subculture/i)).toBeInTheDocument();
    });
  });

  it('should display subtitle when loaded', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Cosmic Explorer',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText('You make timeless elegance your own')).toBeInTheDocument();
    });
  });

  it('should display dos section with items', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Cosmic Explorer',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Choose quality over quantity', 'Invest in timeless pieces'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText('DO')).toBeInTheDocument();
      expect(screen.getByText('Choose quality over quantity')).toBeInTheDocument();
      expect(screen.getByText('Invest in timeless pieces')).toBeInTheDocument();
    });
  });

  it('should display donts section with items', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Cosmic Explorer',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend', 'Compromise on craftsmanship'],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText("DON'T")).toBeInTheDocument();
      expect(screen.getByText('Follow every trend')).toBeInTheDocument();
      expect(screen.getByText('Compromise on craftsmanship')).toBeInTheDocument();
    });
  });

  it('should handle empty dos and donts arrays', async () => {
    const mockData = {
      id: 'tribe-123',
      name: 'Cosmic Explorer',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: [],
      donts: [],
      userResultId: 'test-123',
    };

    (tribeService.fetchTribeWithSubcultureName as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Cosmic Explorer' })).toBeInTheDocument();
    });

    // Should still render the DO and DON'T headers even with empty arrays
    expect(screen.getByText('DO')).toBeInTheDocument();
    expect(screen.getByText("DON'T")).toBeInTheDocument();
  });
});
