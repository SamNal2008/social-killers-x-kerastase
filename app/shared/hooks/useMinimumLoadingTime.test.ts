import { renderHook, waitFor } from '@testing-library/react';
import { useMinimumLoadingTime } from './useMinimumLoadingTime';

describe('useMinimumLoadingTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return true when loading starts', () => {
    const { result } = renderHook(() => useMinimumLoadingTime(true, 500));
    expect(result.current).toBe(true);
  });

  it('should stay true for minimum duration even if loading finishes early', async () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 500),
      { initialProps: { isLoading: true } }
    );

    expect(result.current).toBe(true);

    // Loading finishes after 100ms
    jest.advanceTimersByTime(100);
    rerender({ isLoading: false });

    // Should still be true (minimum 500ms not elapsed)
    expect(result.current).toBe(true);

    // Advance to complete minimum duration
    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false after minimum duration elapses', async () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 500),
      { initialProps: { isLoading: true } }
    );

    // Advance past minimum duration
    jest.advanceTimersByTime(500);
    rerender({ isLoading: false });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should return false immediately if loading takes longer than minimum', async () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 500),
      { initialProps: { isLoading: true } }
    );

    // Loading takes 1000ms (longer than minimum 500ms)
    jest.advanceTimersByTime(1000);
    rerender({ isLoading: false });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should handle multiple loading cycles correctly', async () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 500),
      { initialProps: { isLoading: true } }
    );

    // First cycle - quick load
    jest.advanceTimersByTime(100);
    rerender({ isLoading: false });
    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    // Second cycle
    rerender({ isLoading: true });
    expect(result.current).toBe(true);

    jest.advanceTimersByTime(100);
    rerender({ isLoading: false });
    expect(result.current).toBe(true);

    jest.advanceTimersByTime(400);
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should use custom minimum duration', async () => {
    const { result, rerender } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 1000),
      { initialProps: { isLoading: true } }
    );

    jest.advanceTimersByTime(500);
    rerender({ isLoading: false });

    // Should still be true (custom 1000ms not elapsed)
    expect(result.current).toBe(true);

    jest.advanceTimersByTime(500);
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it('should clean up timers on unmount', () => {
    const { result, rerender, unmount } = renderHook(
      ({ isLoading }) => useMinimumLoadingTime(isLoading, 500),
      { initialProps: { isLoading: true } }
    );

    // Start loading
    expect(result.current).toBe(true);

    // Finish loading quickly
    jest.advanceTimersByTime(100);
    rerender({ isLoading: false });

    // Verify timeout is set (still showing loading due to minimum time)
    expect(result.current).toBe(true);

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // Unmount before minimum time elapses
    unmount();

    // Verify cleanup was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should return false when never loading', () => {
    const { result } = renderHook(() => useMinimumLoadingTime(false, 500));
    expect(result.current).toBe(false);
  });
});
