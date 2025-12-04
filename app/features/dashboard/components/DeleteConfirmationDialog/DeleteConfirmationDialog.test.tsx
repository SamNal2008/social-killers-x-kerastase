import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationDialog } from '../DeleteConfirmationDialog';

describe('DeleteConfirmationDialog', () => {
    const defaultProps = {
        isOpen: true,
        userName: 'John Doe',
        isDeleting: false,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(<DeleteConfirmationDialog {...defaultProps} isOpen={false} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog with correct title', () => {
        render(<DeleteConfirmationDialog {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Result')).toBeInTheDocument();
    });

    it('should display user name in confirmation message', () => {
        render(<DeleteConfirmationDialog {...defaultProps} />);

        expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should call onConfirm when confirm button is clicked', () => {
        const onConfirm = jest.fn();
        render(<DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

        fireEvent.click(screen.getByRole('button', { name: /delete/i }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />);

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when backdrop is clicked', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />);

        fireEvent.click(screen.getByTestId('dialog-backdrop'));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when Escape key is pressed', () => {
        const onCancel = jest.fn();
        render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />);

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isDeleting is true', () => {
        render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);

        expect(screen.getByText(/deleting/i)).toBeInTheDocument();
    });

    it('should disable buttons when isDeleting is true', () => {
        render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);

        const deleteButton = screen.getByRole('button', { name: /deleting/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        expect(deleteButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });

    it('should not call onCancel when backdrop is clicked while deleting', () => {
        const onCancel = jest.fn();
        render(
            <DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} isDeleting={true} />
        );

        fireEvent.click(screen.getByTestId('dialog-backdrop'));

        expect(onCancel).not.toHaveBeenCalled();
    });

    it('should have proper accessibility attributes', () => {
        render(<DeleteConfirmationDialog {...defaultProps} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
    });
});
