// Mock for env utility in tests
// In test environment, we always return true for isDevelopment
export const isDevelopment = (): boolean => {
  return true;
};
