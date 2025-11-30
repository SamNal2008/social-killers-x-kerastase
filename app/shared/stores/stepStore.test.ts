import { stepStore } from './stepStore';
import type { PageType } from '~/onboarding/types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock localStorageUtils
jest.mock('~/shared/utils/localStorage', () => ({
  localStorageUtils: {
    hasUserId: jest.fn(() => false),
    hasUserName: jest.fn(() => false),
  },
}));

describe('stepStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getCurrentPage', () => {
    it('should return WelcomePage when no page is stored', () => {
      const result = stepStore.getCurrentPage();
      expect(result).toBe('WelcomePage');
    });

    it('should return stored page', () => {
      localStorageMock.setItem('kerastase_current_page', 'NamePage');
      
      const result = stepStore.getCurrentPage();
      expect(result).toBe('NamePage');
    });

    it('should return WelcomePage when stored data is invalid', () => {
      localStorageMock.setItem('kerastase_current_page', 'InvalidPage');
      
      const result = stepStore.getCurrentPage();
      expect(result).toBe('WelcomePage');
    });
  });

  describe('setCurrentPage', () => {
    it('should save page to localStorage', () => {
      stepStore.setCurrentPage('NamePage');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'kerastase_current_page',
        'NamePage'
      );
    });
  });

  describe('goToNextPage', () => {
    it('should go from WelcomePage to NamePage', () => {
      localStorageMock.setItem('kerastase_current_page', 'WelcomePage');
      
      const result = stepStore.goToNextPage();
      
      expect(result).toBe('NamePage');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_current_page', 'NamePage');
    });

    it('should go from NamePage to Step2Page', () => {
      localStorageMock.setItem('kerastase_current_page', 'NamePage');
      
      const result = stepStore.goToNextPage();
      
      expect(result).toBe('Step2Page');
    });

    it('should stay on last page when no next page exists', () => {
      localStorageMock.setItem('kerastase_current_page', 'Step4Page');
      
      const result = stepStore.goToNextPage();
      
      expect(result).toBe('Step4Page');
    });
  });

  describe('goToPreviousPage', () => {
    it('should go from NamePage to WelcomePage', () => {
      localStorageMock.setItem('kerastase_current_page', 'NamePage');
      
      const result = stepStore.goToPreviousPage();
      
      expect(result).toBe('WelcomePage');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_current_page', 'WelcomePage');
    });

    it('should stay on first page when no previous page exists', () => {
      localStorageMock.setItem('kerastase_current_page', 'WelcomePage');
      
      const result = stepStore.goToPreviousPage();
      
      expect(result).toBe('WelcomePage');
    });
  });

  describe('goToPage', () => {
    it('should go to specific page', () => {
      stepStore.goToPage('Step3Page');
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_current_page', 'Step3Page');
    });
  });

  describe('getPageNumber', () => {
    it('should return correct page numbers', () => {
      expect(stepStore.getPageNumber('WelcomePage')).toBe(1);
      expect(stepStore.getPageNumber('NamePage')).toBe(2);
      expect(stepStore.getPageNumber('Step2Page')).toBe(3);
      expect(stepStore.getPageNumber('Step3Page')).toBe(4);
      expect(stepStore.getPageNumber('Step4Page')).toBe(5);
    });
  });

  describe('reset', () => {
    it('should remove current page from localStorage', () => {
      stepStore.setCurrentPage('NamePage');
      
      stepStore.reset();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_current_page');
    });
  });

  describe('determineInitialPage', () => {
    const { localStorageUtils } = require('~/shared/utils/localStorage');

    it('should return WelcomePage when no user ID', () => {
      localStorageUtils.hasUserId.mockReturnValue(false);
      localStorageUtils.hasUserName.mockReturnValue(false);
      
      const result = stepStore.determineInitialPage();
      expect(result).toBe('WelcomePage');
    });

    it('should return NamePage when user ID exists but no name', () => {
      localStorageUtils.hasUserId.mockReturnValue(true);
      localStorageUtils.hasUserName.mockReturnValue(false);
      
      const result = stepStore.determineInitialPage();
      expect(result).toBe('NamePage');
    });

    it('should return Step2Page when user has both ID and name', () => {
      localStorageUtils.hasUserId.mockReturnValue(true);
      localStorageUtils.hasUserName.mockReturnValue(true);
      
      const result = stepStore.determineInitialPage();
      expect(result).toBe('Step2Page');
    });
  });
});
