import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardPolaroid } from './DashboardPolaroid';

describe('DashboardPolaroid', () => {
  const defaultProps = {
    userName: 'Romain Lagrange',
    subcultureName: 'Functionals',
    imageUrls: ['https://example.com/image.jpg'],
    timestamp: '2024-12-02T10:42:00Z',
  };

  it('should render user name correctly', () => {
    render(<DashboardPolaroid {...defaultProps} />);
    expect(screen.getByText('Romain Lagrange')).toBeInTheDocument();
  });

  it('should render subculture name as badge', () => {
    render(<DashboardPolaroid {...defaultProps} />);
    expect(screen.getByText('FUNCTIONALS')).toBeInTheDocument();
  });

  it('should render image with correct src and alt', () => {
    render(<DashboardPolaroid {...defaultProps} />);
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('alt', 'Romain Lagrange - Functionals');
  });

  it('should format and display timestamp', () => {
    render(<DashboardPolaroid {...defaultProps} />);
    expect(screen.getByText('10:42 AM')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <DashboardPolaroid {...defaultProps} className="custom-class" />
    );
    const polaroid = container.firstChild;
    expect(polaroid).toHaveClass('custom-class');
  });

  it('should have correct styling structure', () => {
    const { container } = render(<DashboardPolaroid {...defaultProps} />);
    const polaroid = container.firstChild as HTMLElement;

    expect(polaroid).toHaveClass('bg-white');
    expect(polaroid).toHaveClass('rounded-lg');
    expect(polaroid).toHaveClass('p-6');
  });

  it('should display image in container with placeholder background', () => {
    const { container } = render(<DashboardPolaroid {...defaultProps} />);
    const imageContainer = container.querySelector('[data-testid="image-container"]');
    expect(imageContainer).toHaveClass('bg-neutral-gray-200');
  });

  it('should have badge with correct color scheme', () => {
    render(<DashboardPolaroid {...defaultProps} />);
    const badge = screen.getByText('FUNCTIONALS').closest('[data-testid="subculture-badge"]');
    expect(badge).toHaveClass('bg-primary-light');

    const badgeText = screen.getByText('FUNCTIONALS');
    expect(badgeText).toHaveClass('text-primary');
  });

  it('should render with minimal required props', () => {
    render(
      <DashboardPolaroid
        userName="John Doe"
        subcultureName="Creatives"
        imageUrls={['https://example.com/test.jpg']}
        timestamp="2024-12-02T14:30:00Z"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('CREATIVES')).toBeInTheDocument();
    expect(screen.getByText('2:30 PM')).toBeInTheDocument();
  });

  describe('delete functionality', () => {
    it('should render delete button when onDelete is provided', () => {
      const onDelete = jest.fn();
      render(<DashboardPolaroid {...defaultProps} onDelete={onDelete} />);

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should not render delete button when onDelete is not provided', () => {
      render(<DashboardPolaroid {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = jest.fn();
      render(<DashboardPolaroid {...defaultProps} onDelete={onDelete} />);

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));

      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
