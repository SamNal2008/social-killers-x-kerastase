import '@testing-library/jest-dom';

// Mock import.meta for Jest
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: 'http://localhost:54321',
        VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'test-key',
        DEV: true,
      }
    }
  }
});

// Global Supabase mocks
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = require('./__mocks__/supabase');
  return mockSupabase;
});

jest.mock('~/shared/services/supabase', () => {
  const mockSupabase = require('./__mocks__/supabase');
  return {
    supabase: mockSupabase.supabase,
  };
});
