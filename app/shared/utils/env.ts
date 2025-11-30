export const isDevelopment = (): boolean => {
  // Check if we're in Jest environment first
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return (globalThis as any).import?.meta?.env?.DEV === true;
  }
  
  // In browser/Vite environment
  try {
    return import.meta.env.DEV === true;
  } catch {
    return false;
  }
};