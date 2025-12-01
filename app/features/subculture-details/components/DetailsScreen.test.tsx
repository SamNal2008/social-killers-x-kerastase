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
      description: 'Understated refinement is your signature. You appreciate beauty in discretion, favoring quality over volume.',
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
      description: 'Understated refinement is your signature. You appreciate beauty in discretion, favoring quality over volume.',
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/understated refinement/i)).toBeInTheDocument();
    });
  });

  it('should display "Generate my AI moodboard" button', async () => {
    const mockData = {
      id: 'subculture-123',
      name: 'Functionals',
      description: 'Understated refinement is your signature.',
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
      description: 'Understated refinement is your signature.',
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
      description: 'Understated refinement is your signature.',
      userResultId: 'test-123',
    };

    (subcultureService.fetchSubcultureByUserResultId as jest.Mock).mockResolvedValue(mockData);

    render(<DetailsScreen userResultId="test-123" />);

    await waitFor(() => {
      expect(screen.getByText(/your kérastase subculture/i)).toBeInTheDocument();
    });
  });
});
