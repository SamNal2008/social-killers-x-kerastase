/**
 * URL utility functions for handling Supabase Storage URLs
 */

/**
 * Extracts the filename from a Supabase Storage URL
 * Handles both public URLs and URLs with query parameters
 *
 * @example
 * extractFilenameFromUrl('https://...storage.../file.jpg?token=xyz')
 * // Returns: 'file.jpg'
 */
export const extractFilenameFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  const lastPart = urlParts[urlParts.length - 1];
  // Remove query params (e.g., ?token=...)
  return lastPart.split('?')[0];
};

/**
 * Validates if a URL is a valid HTTP/HTTPS URL
 */
export const isValidHttpUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Extracts the storage path from a Supabase Storage URL
 * Returns the path after the bucket name
 *
 * @example
 * extractStoragePath('https://.../storage/v1/object/public/generated-images/file.jpg')
 * // Returns: 'file.jpg'
 */
export const extractStoragePath = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find the bucket name index (after 'public' or 'authenticated')
    const bucketIndex = pathParts.findIndex(
      (part) => part === 'public' || part === 'authenticated'
    );

    if (bucketIndex === -1 || bucketIndex >= pathParts.length - 2) {
      return null;
    }

    // Return everything after the bucket name
    return pathParts.slice(bucketIndex + 2).join('/');
  } catch {
    return null;
  }
};
