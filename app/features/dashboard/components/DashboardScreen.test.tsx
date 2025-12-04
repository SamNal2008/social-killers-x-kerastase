import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardScreen } from './DashboardScreen';
import { dashboardService, ResultNotFoundError } from '../services/dashboardService';
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
      () => new Promise(() => { })
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

  describe('delete functionality', () => {
    it('should render delete buttons for each result', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

      render(<DashboardScreen />);

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
        expect(deleteButtons).toHaveLength(2);
      });
    });

    it('should open confirmation dialog when delete button is clicked', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Result')).toBeInTheDocument();
      });
    });

    it('should close confirmation dialog when cancel is clicked', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should remove result from list after successful deletion', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);
      (dashboardService.deleteResult as jest.Mock).mockResolvedValue(undefined);

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.queryByText('Romain Lagrange')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should handle ResultNotFoundError by triggering page refresh', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);
      (dashboardService.deleteResult as jest.Mock).mockRejectedValue(
        new ResultNotFoundError()
      );

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(dashboardService.deleteResult).toHaveBeenCalledWith('result-1');
      });
    });

    it('should show error message on deletion failure', async () => {
      (dashboardService.getUserResults as jest.Mock).mockResolvedValue(mockResults);
      (dashboardService.deleteResult as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      render(<DashboardScreen />);

      await waitFor(() => {
        expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to delete/i)).toBeInTheDocument();
      });
    });
  });
});
