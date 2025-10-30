/**
 * Generate an optimized image URL for display
 * Uses Supabase's image transformation API to resize/compress images
 * 
 * @param originalUrl - The original image URL from storage
 * @param width - Target width in pixels (default: 1920 for Full HD)
 * @param quality - JPEG quality 1-100 (default: 80)
 * @returns Optimized image URL for faster loading
 */
export const getOptimizedImageUrl = (
  originalUrl: string,
  width: number = 1920,
  quality: number = 80
): string => {
  // Check if it's a Supabase storage URL
  if (!originalUrl.includes('supabase.co/storage')) {
    return originalUrl;
  }

  // Extract the path after /storage/v1/object/public/
  const match = originalUrl.match(/\/storage\/v1\/object\/public\/(.+)/);
  if (!match) {
    return originalUrl;
  }

  const path = match[1];
  const baseUrl = originalUrl.split('/storage/v1/object/public/')[0];

  // Use Supabase's render endpoint for image transformation
  // This resizes and compresses the image on-the-fly
  return `${baseUrl}/storage/v1/render/image/public/${path}?width=${width}&quality=${quality}`;
};

/**
 * Get thumbnail URL for small previews
 */
export const getThumbnailUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, 400, 70);
};

/**
 * Get preview URL for main display
 */
export const getPreviewUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, 1920, 80);
};

/**
 * Get original URL for download (no optimization)
 */
export const getOriginalUrl = (url: string): string => {
  return url; // Return as-is for full quality download
};
