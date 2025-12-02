import { render, screen, fireEvent } from '@testing-library/react';
import { ZoomModal } from './ZoomModal';
import { describe, it, expect, jest } from '@jest/globals';

describe('ZoomModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    imageUrl: 'https://example.com/moodboard.jpg',
    altText: 'Test moodboard',
  };

  it('should render when isOpen is true', () => {
    render(<ZoomModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<ZoomModal {...defaultProps} isOpen={false} />);

    const modal = screen.queryByRole('dialog');
    expect(modal).not.toBeInTheDocument();
  });

  it('should display image with correct src and alt text', () => {
    render(<ZoomModal {...defaultProps} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', defaultProps.imageUrl);
    expect(image).toHaveAttribute('alt', defaultProps.altText);
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<ZoomModal {...defaultProps} onClose={onClose} />);

    const backdrop = screen.getByTestId('zoom-modal-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<ZoomModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText(/close zoom view/i);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when ESC key is pressed', () => {
    const onClose = jest.fn();
    render(<ZoomModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when clicking on the image', () => {
    const onClose = jest.fn();
    render(<ZoomModal {...defaultProps} onClose={onClose} />);

    const image = screen.getByRole('img');
    fireEvent.click(image);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should have proper ARIA attributes', () => {
    render(<ZoomModal {...defaultProps} />);

    const modal = screen.getByRole('dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
  });

  it('should have accessible close button', () => {
    render(<ZoomModal {...defaultProps} />);

    const closeButton = screen.getByLabelText(/close zoom view/i);
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('type', 'button');
  });

  it('should not close when pressing other keys', () => {
    const onClose = jest.fn();
    render(<ZoomModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space', code: 'Space' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
