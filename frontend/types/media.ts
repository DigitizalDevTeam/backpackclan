export type MediaType = "image" | "video" | "document";

export interface MediaItem {
  id: string;
  uuid: string;
  filename: string;
  url: string;
  mimeType: string;
  mediaType: MediaType;
  size: number;
  altText: string;
  title: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadInput {
  filename: string;
  url: string;
  mimeType: string;
  mediaType: MediaType;
  size: number;
  uploadedBy: string;
}
