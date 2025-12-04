import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MoodboardImportDialog } from './MoodboardImportDialog';
import { moodboardUploadService } from '../../services/moodboardUploadService';

jest.mock('../../services/moodboardUploadService');

const mockSubcultures = [
  {
    id: 'sub-1',
    name: 'LEGACISTS',
    moodboardId: 'mood-1',
    currentImageUrl: 'https://example.com/img1.jpg',
  },
  {
    id: 'sub-2',
    name: 'FUNCTIONALS',
    moodboardId: 'mood-2',
    currentImageUrl: 'https://example.com/img2.jpg',
  },
  {
    id: 'sub-3',
    name: 'ROMANTICS',
    moodboardId: null,
    currentImageUrl: null,
  },
];

describe('MoodboardImportDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (moodboardUploadService.fetchSubculturesWithMoodboards as jest.Mock).mockResolvedValue(
      mockSubcultures
    );
  });

  it('should not render when isOpen is false', () => {
    render(<MoodboardImportDialog {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog with title when isOpen is true', async () => {
    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText(/import moodboard images/i)).toBeInTheDocument();
  });

  it('should show loading state while fetching subcultures', async () => {
    (moodboardUploadService.fetchSubculturesWithMoodboards as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<MoodboardImportDialog {...defaultProps} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display all subcultures when loaded', async () => {
    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
      expect(screen.getByText('FUNCTIONALS')).toBeInTheDocument();
      expect(screen.getByText('ROMANTICS')).toBeInTheDocument();
    });
  });

  it('should show error state when fetch fails', async () => {
    (moodboardUploadService.fetchSubculturesWithMoodboards as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load subcultures/i)).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', async () => {
    const onClose = jest.fn();
    render(<MoodboardImportDialog {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', async () => {
    const onClose = jest.fn();
    render(<MoodboardImportDialog {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when ESC key is pressed', async () => {
    const onClose = jest.fn();
    render(<MoodboardImportDialog {...defaultProps} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should disable save button when no files are selected', async () => {
    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when files are selected', async () => {
    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input-sub-1');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('should upload files and update database when save is clicked', async () => {
    (moodboardUploadService.uploadMoodboardImage as jest.Mock).mockResolvedValue({
      success: true,
      imageUrl: 'https://storage.example.com/new-image.jpg',
    });
    (moodboardUploadService.updateMoodboardImageUrl as jest.Mock).mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    render(<MoodboardImportDialog {...defaultProps} onSuccess={onSuccess} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input-sub-1');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(moodboardUploadService.uploadMoodboardImage).toHaveBeenCalledWith(file, 'sub-1');
      expect(moodboardUploadService.updateMoodboardImageUrl).toHaveBeenCalledWith(
        'mood-1',
        'https://storage.example.com/new-image.jpg'
      );
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should create moodboard if subculture has none', async () => {
    (moodboardUploadService.uploadMoodboardImage as jest.Mock).mockResolvedValue({
      success: true,
      imageUrl: 'https://storage.example.com/new-image.jpg',
    });
    (moodboardUploadService.createMoodboardForSubculture as jest.Mock).mockResolvedValue(
      'new-mood-id'
    );
    (moodboardUploadService.updateMoodboardImageUrl as jest.Mock).mockResolvedValue(undefined);

    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('ROMANTICS')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input-sub-3');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(moodboardUploadService.createMoodboardForSubculture).toHaveBeenCalledWith('sub-3');
      expect(moodboardUploadService.updateMoodboardImageUrl).toHaveBeenCalledWith(
        'new-mood-id',
        'https://storage.example.com/new-image.jpg'
      );
    });
  });

  it('should show error when upload fails', async () => {
    (moodboardUploadService.uploadMoodboardImage as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Upload failed',
    });

    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input-sub-1');
    fireEvent.change(fileInput, { target: { files: [file] } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    render(<MoodboardImportDialog {...defaultProps} />);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });
});
