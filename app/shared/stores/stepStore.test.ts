import { renderHook, act } from '@testing-library/react';
import { useStepStore } from './stepStore';
import { localStorageUtils } from '../utils/localStorage';

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
});

// Mock localStorageUtils
jest.mock('~/shared/utils/localStorage', () => ({
    localStorageUtils: {
        set: jest.fn(),
        get: jest.fn(),
        remove: jest.fn(),
        hasUserId: jest.fn(() => false),
        hasUserName: jest.fn(() => false),
        clearAllUserData: jest.fn(),
    },
}));

const mockLocalStorageUtils = localStorageUtils as jest.Mocked<typeof localStorageUtils>;

describe('stepStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocalStorageUtils.get.mockReturnValue(null);
        mockLocalStorageUtils.hasUserId.mockReturnValue(false);
        mockLocalStorageUtils.hasUserName.mockReturnValue(false);
    });

    describe('getCurrentPage', () => {
        it('should return WelcomePage as default', () => {
            const { result } = renderHook(() => useStepStore());
            expect(result.current.getCurrentPage()).toBe('WelcomePage');
        });

        it('should return current page from state', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('NamePage');
            });
            expect(result.current.getCurrentPage()).toBe('NamePage');
        });
    });

    describe('setCurrentPage', () => {
        it('should update current page and save to localStorage', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('NamePage');
            });

            expect(result.current.getCurrentPage()).toBe('NamePage');
            expect(mockLocalStorageUtils.set).toHaveBeenCalledWith(
                'kerastase_current_page',
                'NamePage'
            );
        });
    });

    describe('goToNextPage', () => {
        it('should go from WelcomePage to NamePage', () => {
            const { result } = renderHook(() => useStepStore());
            // Start at WelcomePage (default)
            act(() => {
                result.current.goToNextPage();
            });

            expect(result.current.getCurrentPage()).toBe('NamePage');
        });

        it('should go from NamePage to Step2Page', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('NamePage');
            });
            act(() => {
                result.current.goToNextPage();
            });

            expect(result.current.getCurrentPage()).toBe('Step2Page');
        });

        it('should stay on last page when no next page exists', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('Step4Page');
            });
            act(() => {
                result.current.goToNextPage();
            });

            expect(result.current.getCurrentPage()).toBe('Step4Page');
        });
    });

    describe('goToPreviousPage', () => {
        it('should go from NamePage to WelcomePage', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('NamePage');
            });
            act(() => {
                result.current.goToPreviousPage();
            });

            expect(result.current.getCurrentPage()).toBe('WelcomePage');
        });

        it('should stay on first page when no previous page exists', () => {
            const { result } = renderHook(() => useStepStore());
            // Start at WelcomePage (default)
            act(() => {
                result.current.goToPreviousPage();
            });

            expect(result.current.getCurrentPage()).toBe('WelcomePage');
        });
    });

    describe('goToPage', () => {
        it('should go to specific page', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.goToPage('KeywordPage');
            });

            expect(result.current.getCurrentPage()).toBe('Step2Page');
        });
    });

    describe('getPageNumber', () => {
        it('should return correct page numbers', () => {
            const { result } = renderHook(() => useStepStore());
            expect(result.current.getPageNumber('WelcomePage')).toBe(1);
            expect(result.current.getPageNumber('NamePage')).toBe(2);
            expect(result.current.getPageNumber('KeywordPage')).toBe(3);
            expect(result.current.getPageNumber('TinderPage')).toBe(4);
            expect(result.current.getPageNumber('Step4Page')).toBe(5);
        });
    });

    describe('reset', () => {
        it('should reset to WelcomePage', () => {
            const { result } = renderHook(() => useStepStore());
            act(() => {
                result.current.setCurrentPage('NamePage');
            });
            act(() => {
                result.current.reset();
            });

            expect(result.current.getCurrentPage()).toBe('WelcomePage');
        });
    });

    describe('determineInitialPage', () => {
        it('should return WelcomePage when no user ID', () => {
            const { result } = renderHook(() => useStepStore());
            mockLocalStorageUtils.hasUserId.mockReturnValue(false);
            mockLocalStorageUtils.hasUserName.mockReturnValue(false);

            const res = result.current.determineInitialPage();
            expect(res).toBe('WelcomePage');
        });

        it('should return NamePage when user ID exists but no name', () => {
            const { result } = renderHook(() => useStepStore());
            mockLocalStorageUtils.hasUserId.mockReturnValue(true);
            mockLocalStorageUtils.hasUserName.mockReturnValue(false);

            const res = result.current.determineInitialPage();
            expect(res).toBe('NamePage');
        });

        it('should return Step2Page when user has both ID and name', () => {
            const { result } = renderHook(() => useStepStore());
            mockLocalStorageUtils.hasUserId.mockReturnValue(true);
            mockLocalStorageUtils.hasUserName.mockReturnValue(true);

            const res = result.current.determineInitialPage();
            expect(res).toBe('Step2Page');
        });
    });
});
