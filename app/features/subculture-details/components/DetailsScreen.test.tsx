import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DetailsScreen } from './DetailsScreen';
import { subcultureService } from '../services/subcultureService';

jest.mock('../services/subcultureService');
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

  it('should display loading state initially', () => {
    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockImplementation(
      () => new Promise(() => { })
    );

    render(<DetailsScreen userResultId="test-123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display subculture name when loaded', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion, favoring quality over volume.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Functionals' })).toBeInTheDocument();
    });
  });

  it('should display subculture description when loaded', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion, favoring quality over volume.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/appreciate beauty in discretion/i)).toBeInTheDocument();
    });
  });

  it('should display "Generate my AI moodboard" button', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate my ai moodboard/i })).toBeInTheDocument();
    });
  });

  it('should display error state on fetch failure', async () => {
    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch subculture')
    );

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should have back button that navigates to results', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      subtitle: 'Understated refinement is your signature',
      description: 'You appreciate beauty in discretion.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Functionals' })).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await userEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/results?userResultId=test-123');
  });

  it('should display "YOUR KÉRASTASE SUBCULTURE" header', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      subtitle: 'You make timeless elegance your own',
      description: 'Understated refinement is your signature.',
      dos: ['Choose quality over quantity', 'Invest in timeless pieces'],
      donts: ['Follow every trend', 'Compromise on craftsmanship'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/your kérastase subculture/i)).toBeInTheDocument();
    });
  });

  it('should display subtitle when loaded', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Legacist',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Item 1'],
      donts: ['Item 2'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText('You make timeless elegance your own')).toBeInTheDocument();
    });
  });

  it('should display dos section with items', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Legacist',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Choose quality over quantity', 'Invest in timeless pieces'],
      donts: ['Follow every trend'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText('DO')).toBeInTheDocument();
      expect(screen.getByText('Choose quality over quantity')).toBeInTheDocument();
      expect(screen.getByText('Invest in timeless pieces')).toBeInTheDocument();
    });
  });

  it('should display donts section with items', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Legacist',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: ['Choose quality over quantity'],
      donts: ['Follow every trend', 'Compromise on craftsmanship'],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText("DON'T")).toBeInTheDocument();
      expect(screen.getByText('Follow every trend')).toBeInTheDocument();
      expect(screen.getByText('Compromise on craftsmanship')).toBeInTheDocument();
    });
  });

  it('should handle empty dos and donts arrays', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Legacist',
      subtitle: 'You make timeless elegance your own',
      description: 'Full description here.',
      dos: [],
      donts: [],
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Legacist' })).toBeInTheDocument();
    });

    // Should still render the DO and DON'T headers even with empty arrays
    expect(screen.getByText('DO')).toBeInTheDocument();
    expect(screen.getByText("DON'T")).toBeInTheDocument();
  });
});
