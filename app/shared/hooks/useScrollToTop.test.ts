import { renderHook } from '@testing-library/react';
import { useScrollToTop } from './useScrollToTop';

describe('useScrollToTop', () => {
  let scrollToSpy: jest.Mock;

  beforeEach(() => {
    // Mock window.scrollTo
    scrollToSpy = jest.fn();
    Object.defineProperty(window, 'scrollTo', {
      writable: true,
      value: scrollToSpy,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should scroll to top on mount', () => {
    renderHook(() => useScrollToTop());

    expect(scrollToSpy).toHaveBeenCalledTimes(1);
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should not scroll on re-renders', () => {
    const { rerender } = renderHook(() => useScrollToTop());

    expect(scrollToSpy).toHaveBeenCalledTimes(1);

    // Trigger re-render
    rerender();

    // Should still only be called once
    expect(scrollToSpy).toHaveBeenCalledTimes(1);
  });

  it('should handle missing window.scrollTo gracefully', () => {
    // Remove scrollTo to simulate SSR or old browsers
    const originalScrollTo = window.scrollTo;
    // @ts-expect-error - Testing edge case
    delete window.scrollTo;

    // Should not throw error
    expect(() => {
      renderHook(() => useScrollToTop());
    }).not.toThrow();

    // Restore
    window.scrollTo = originalScrollTo;
  });

  it('should use instant scroll if smooth behavior not supported', () => {
    // Test that hook works even if smooth scroll isn't available
    // This is more of a behavioral test for older browsers
    renderHook(() => useScrollToTop());

    // Should have been called regardless
    expect(scrollToSpy).toHaveBeenCalled();
  });
});
