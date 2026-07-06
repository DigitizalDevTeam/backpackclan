export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getMediaTypeFromMime(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const ALLOWED_VIDEO_TYPES = ["video/mp4"];
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf"];

export function validateMediaFile(file: File): string | null {
  const mediaType = getMediaTypeFromMime(file.type);

  if (mediaType === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, WebP, and GIF images are allowed";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return "Image must be smaller than 5 MB";
    }
  } else if (mediaType === "video") {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      return "Only MP4 videos are allowed";
    }
    if (file.size > MAX_VIDEO_SIZE) {
      return "Video must be smaller than 50 MB";
    }
  } else {
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return "Only PDF documents are allowed";
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      return "Document must be smaller than 10 MB";
    }
  }

  return null;
}
