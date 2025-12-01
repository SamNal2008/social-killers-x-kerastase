import { localStorageUtils } from './localStorage';

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

describe('localStorageUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('setUserId', () => {
    it('should store user ID in localStorage', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      
      localStorageUtils.setUserId(userId);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_user_id', userId);
    });
  });

  describe('getUserId', () => {
    it('should retrieve user ID from localStorage', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      localStorageMock.setItem('kerastase_user_id', userId);
      
      const result = localStorageUtils.getUserId();
      
      expect(result).toBe(userId);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kerastase_user_id');
    });

    it('should return null when no user ID is stored', () => {
      const result = localStorageUtils.getUserId();
      
      expect(result).toBeNull();
    });
  });

  describe('removeUserId', () => {
    it('should remove user ID from localStorage', () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      localStorageMock.setItem('kerastase_user_id', userId);
      
      localStorageUtils.removeUserId();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_id');
    });
  });

  describe('setUserName', () => {
    it('should store user name in localStorage', () => {
      const userName = 'John Doe';
      
      localStorageUtils.setUserName(userName);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_user_name', userName);
    });
  });

  describe('getUserName', () => {
    it('should retrieve user name from localStorage', () => {
      const userName = 'John Doe';
      localStorageMock.setItem('kerastase_user_name', userName);
      
      const result = localStorageUtils.getUserName();
      
      expect(result).toBe(userName);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kerastase_user_name');
    });

    it('should return null when no user name is stored', () => {
      const result = localStorageUtils.getUserName();
      
      expect(result).toBeNull();
    });
  });

  describe('removeUserName', () => {
    it('should remove user name from localStorage', () => {
      const userName = 'John Doe';
      localStorageMock.setItem('kerastase_user_name', userName);
      
      localStorageUtils.removeUserName();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_name');
    });
  });

  describe('clearAllUserData', () => {
    it('should remove all user data from localStorage', () => {
      localStorageUtils.clearAllUserData();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_id');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_name');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_result_id');
    });
  });

  describe('hasUserId', () => {
    it('should return true when user ID exists', () => {
      localStorageMock.setItem('kerastase_user_id', '123');
      
      const result = localStorageUtils.hasUserId();
      
      expect(result).toBe(true);
    });

    it('should return false when user ID does not exist', () => {
      const result = localStorageUtils.hasUserId();
      
      expect(result).toBe(false);
    });
  });

  describe('hasUserName', () => {
    it('should return true when user name exists', () => {
      localStorageMock.setItem('kerastase_user_name', 'John Doe');

      const result = localStorageUtils.hasUserName();

      expect(result).toBe(true);
    });

    it('should return false when user name does not exist', () => {
      const result = localStorageUtils.hasUserName();

      expect(result).toBe(false);
    });
  });

  describe('setUserResultId', () => {
    it('should store user result ID in localStorage', () => {
      const userResultId = '456e7890-e89b-12d3-a456-426614174001';

      localStorageUtils.setUserResultId(userResultId);

      expect(localStorageMock.setItem).toHaveBeenCalledWith('kerastase_user_result_id', userResultId);
    });
  });

  describe('getUserResultId', () => {
    it('should retrieve user result ID from localStorage', () => {
      const userResultId = '456e7890-e89b-12d3-a456-426614174001';
      localStorageMock.setItem('kerastase_user_result_id', userResultId);

      const result = localStorageUtils.getUserResultId();

      expect(result).toBe(userResultId);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('kerastase_user_result_id');
    });

    it('should return null when no user result ID is stored', () => {
      const result = localStorageUtils.getUserResultId();

      expect(result).toBeNull();
    });
  });

  describe('removeUserResultId', () => {
    it('should remove user result ID from localStorage', () => {
      const userResultId = '456e7890-e89b-12d3-a456-426614174001';
      localStorageMock.setItem('kerastase_user_result_id', userResultId);

      localStorageUtils.removeUserResultId();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('kerastase_user_result_id');
    });
  });

  describe('hasUserResultId', () => {
    it('should return true when user result ID exists', () => {
      localStorageMock.setItem('kerastase_user_result_id', '456e7890-e89b-12d3-a456-426614174001');

      const result = localStorageUtils.hasUserResultId();

      expect(result).toBe(true);
    });

    it('should return false when user result ID does not exist', () => {
      const result = localStorageUtils.hasUserResultId();

      expect(result).toBe(false);
    });
  });
});
