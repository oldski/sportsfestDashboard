// Max image size in bytes
export const MAX_IMAGE_SIZE = 5000000; // 5 MB

// Accepted image MIME types for upload (matches server-side supported formats)
// Excludes SVG to prevent XSS vulnerabilities
export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif']
} as const;

export enum FileUploadAction {
  None = 'NONE',
  Update = 'UPDATE',
  Delete = 'DELETE'
}
