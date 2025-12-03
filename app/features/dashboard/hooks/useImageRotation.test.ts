import { renderHook, act } from '@testing-library/react';
import { useImageRotation } from './useImageRotation';

describe('useImageRotation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return first image initially', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    const { result } = renderHook(() => useImageRotation(images));

    expect(result.current).toBe('image1.jpg');
  });

  it('should rotate to next image after 3 seconds', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    const { result } = renderHook(() => useImageRotation(images));

    expect(result.current).toBe('image1.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current).toBe('image2.jpg');
  });

  it('should rotate through all images and loop back', () => {
    const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    const { result } = renderHook(() => useImageRotation(images));

    expect(result.current).toBe('image1.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('image2.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('image3.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('image1.jpg');
  });

  it('should not rotate when only one image is provided', () => {
    const images = ['single-image.jpg'];
    const { result } = renderHook(() => useImageRotation(images));

    expect(result.current).toBe('single-image.jpg');

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current).toBe('single-image.jpg');
  });

  it('should not rotate when empty array is provided', () => {
    const images: string[] = [];
    const { result } = renderHook(() => useImageRotation(images));

    expect(result.current).toBeUndefined();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current).toBeUndefined();
  });

  it('should use custom interval when provided', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    const { result } = renderHook(() => useImageRotation(images, 5000));

    expect(result.current).toBe('image1.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('image1.jpg'); // Should not change yet

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current).toBe('image2.jpg'); // Now it should change
  });

  it('should cleanup interval on unmount', () => {
    const images = ['image1.jpg', 'image2.jpg'];
    const { unmount } = renderHook(() => useImageRotation(images));

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should restart rotation when images array changes', () => {
    const { result, rerender } = renderHook(
      ({ images }) => useImageRotation(images),
      { initialProps: { images: ['image1.jpg', 'image2.jpg'] } }
    );

    expect(result.current).toBe('image1.jpg');

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('image2.jpg');

    // Change images array
    rerender({ images: ['new1.jpg', 'new2.jpg', 'new3.jpg'] });

    expect(result.current).toBe('new1.jpg'); // Should reset to first image

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('new2.jpg');
  });
});
