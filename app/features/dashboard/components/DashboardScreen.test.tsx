import { render, screen, waitFor } from '@testing-library/react';
import { DashboardScreen } from './DashboardScreen';
import { dashboardService } from '../services/dashboardService';
import type { DashboardUserResult } from '../types';

jest.mock('../services/dashboardService');

describe('DashboardScreen', () => {
  const mockResults: DashboardUserResult[] = [
    {
      id: 'result-1',
      userId: 'user-1',
      userName: 'Romain Lagrange',
      tribeId: 'tribe-1',
      subcultureName: 'Functionals',
      generatedImageUrl: 'https://example.com/image1.jpg',
      imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image1-alt.jpg'],
      createdAt: '2024-12-02T10:42:00Z',
    },
    {
      id: 'result-2',
      userId: 'user-2',
      userName: 'Jane Doe',
      tribeId: 'tribe-2',
      subcultureName: 'Creatives',
      generatedImageUrl: 'https://example.com/image2.jpg',
      imageUrls: ['https://example.com/image2.jpg', 'https://example.com/image2-alt.jpg'],
      createdAt: '2024-12-02T11:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with correct title and subtitle', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Kérastase collective')).toBeInTheDocument();
      expect(screen.getByText('Live dashboard')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    (dashboardService.getUserResults as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DashboardScreen />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should fetch and display user results', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    const errorMessage = 'Failed to fetch dashboard data';
    (dashboardService.getUserResults as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no results', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue([]);

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  it('should render polaroid cards for each result', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

    render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      expect(screen.getByText('FUNCTIONALS')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('CREATIVES')).toBeInTheDocument();
    });
  });

  it('should have correct layout structure', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

    const { container } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
    });

    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('bg-surface-light');
  });

  it('should have divider with correct color', async () => {
    (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

    const { container } = render(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText('Kérastase collective')).toBeInTheDocument();
    });

    const divider = container.querySelector('[data-testid="header-divider"]');
    expect(divider).toHaveClass('bg-primary');
  });
});
