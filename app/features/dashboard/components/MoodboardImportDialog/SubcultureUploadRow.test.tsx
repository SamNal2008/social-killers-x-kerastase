import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubcultureUploadRow } from './SubcultureUploadRow';
import type { SubcultureWithMoodboard } from '../../services/moodboardUploadService';

describe('SubcultureUploadRow', () => {
  const defaultSubculture: SubcultureWithMoodboard = {
    id: 'sub-1',
    name: 'LEGACISTS',
    moodboardId: 'mood-1',
    currentImageUrl: 'https://example.com/current.jpg',
  };

  const defaultProps = {
    subculture: defaultSubculture,
    selectedFile: null,
    onFileSelect: jest.fn(),
    uploadStatus: 'idle' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render subculture name', () => {
    render(<SubcultureUploadRow {...defaultProps} />);

    expect(screen.getByText('LEGACISTS')).toBeInTheDocument();
  });

  it('should render current image thumbnail when available', () => {
    render(<SubcultureUploadRow {...defaultProps} />);

    const thumbnail = screen.getByRole('img', { name: /current moodboard for legacists/i });
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute('src', 'https://example.com/current.jpg');
  });

  it('should show placeholder when no current image', () => {
    const subcultureWithoutImage = {
      ...defaultSubculture,
      currentImageUrl: null,
    };
    render(<SubcultureUploadRow {...defaultProps} subculture={subcultureWithoutImage} />);

    expect(screen.getByText(/no image/i)).toBeInTheDocument();
  });

  it('should have file input with correct accept attribute', () => {
    render(<SubcultureUploadRow {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input-sub-1');
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  });

  it('should call onFileSelect when file is selected', async () => {
    const onFileSelect = jest.fn();
    render(<SubcultureUploadRow {...defaultProps} onFileSelect={onFileSelect} />);

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('file-input-sub-1');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onFileSelect).toHaveBeenCalledWith('sub-1', file);
    });
  });

  it('should show preview when file is selected', () => {
    const selectedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(<SubcultureUploadRow {...defaultProps} selectedFile={selectedFile} />);

    expect(screen.getByText('test.jpg')).toBeInTheDocument();
  });

  it('should show uploading status', () => {
    render(<SubcultureUploadRow {...defaultProps} uploadStatus="uploading" />);

    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });

  it('should show success status', () => {
    render(<SubcultureUploadRow {...defaultProps} uploadStatus="success" />);

    expect(screen.getByText(/uploaded/i)).toBeInTheDocument();
  });

  it('should show error status with message', () => {
    render(
      <SubcultureUploadRow
        {...defaultProps}
        uploadStatus="error"
        errorMessage="Upload failed"
      />
    );

    expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
  });

  it('should disable file input when uploading', () => {
    render(<SubcultureUploadRow {...defaultProps} uploadStatus="uploading" />);

    const fileInput = screen.getByTestId('file-input-sub-1');
    expect(fileInput).toBeDisabled();
  });

  it('should have accessible upload button', () => {
    render(<SubcultureUploadRow {...defaultProps} />);

    const uploadButton = screen.getByRole('button', { name: /choose file/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('should allow clearing selected file', () => {
    const onFileSelect = jest.fn();
    const selectedFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    render(
      <SubcultureUploadRow
        {...defaultProps}
        selectedFile={selectedFile}
        onFileSelect={onFileSelect}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(onFileSelect).toHaveBeenCalledWith('sub-1', null);
  });
});
