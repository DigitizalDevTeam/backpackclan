import type { MediaItem, MediaUploadInput } from "@/types/media";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const SEED_MEDIA: MediaItem[] = [
  {
    id: "1",
    uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    filename: "ladakh-hero.jpg",
    url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 312000,
    altText: "Scenic mountain road in Ladakh",
    title: "Ladakh Hero Banner",
    uploadedBy: "1",
    createdAt: "2026-01-10T08:00:00.000Z",
    updatedAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "2",
    uuid: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    filename: "spiti-valley.jpg",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 287000,
    altText: "Spiti Valley snow-capped peaks",
    title: "Spiti Valley",
    uploadedBy: "1",
    createdAt: "2026-01-12T09:30:00.000Z",
    updatedAt: "2026-01-12T09:30:00.000Z",
  },
  {
    id: "3",
    uuid: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    filename: "kashmir-dal-lake.jpg",
    url: "https://images.unsplash.com/photo-1588668008351-45825434fd4e?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 265000,
    altText: "Shikara boats on Dal Lake, Kashmir",
    title: "Kashmir Dal Lake",
    uploadedBy: "2",
    createdAt: "2026-01-15T11:00:00.000Z",
    updatedAt: "2026-01-15T11:00:00.000Z",
  },
  {
    id: "4",
    uuid: "d4e5f6a7-b8c9-0123-def0-234567890123",
    filename: "bhutan-monastery.jpg",
    url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 298000,
    altText: "Tiger's Nest monastery in Bhutan",
    title: "Bhutan Monastery",
    uploadedBy: "2",
    createdAt: "2026-01-18T14:00:00.000Z",
    updatedAt: "2026-01-18T14:00:00.000Z",
  },
  {
    id: "5",
    uuid: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    filename: "nepal-everest.jpg",
    url: "https://images.unsplash.com/photo-1544735716-392fe8d79f04?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 341000,
    altText: "Mount Everest view from Nepal",
    title: "Nepal Everest",
    uploadedBy: "1",
    createdAt: "2026-01-20T10:00:00.000Z",
    updatedAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "6",
    uuid: "f6a7b8c9-d0e1-2345-f012-456789012345",
    filename: "hero-mountains.mp4",
    url: "https://cdn.coverr.co/videos/coverr-flying-over-the-mountains-5666/1080p.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 8500000,
    altText: "Aerial mountain landscape",
    title: "Hero Mountains Video",
    uploadedBy: "1",
    createdAt: "2026-02-01T16:00:00.000Z",
    updatedAt: "2026-02-01T16:00:00.000Z",
  },
  {
    id: "7",
    uuid: "a7b8c9d0-e1f2-3456-0123-567890123456",
    filename: "trek-group.jpg",
    url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 276000,
    altText: "Group trekking in the Himalayas",
    title: "Trek Group Photo",
    uploadedBy: "2",
    createdAt: "2026-02-05T09:00:00.000Z",
    updatedAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "8",
    uuid: "b8c9d0e1-f2a3-4567-1234-678901234567",
    filename: "travel-brochure.pdf",
    url: "/media/sample-brochure.pdf",
    mimeType: "application/pdf",
    mediaType: "document",
    size: 156000,
    altText: "Backpackclan travel brochure",
    title: "Travel Brochure 2026",
    uploadedBy: "1",
    createdAt: "2026-02-10T12:00:00.000Z",
    updatedAt: "2026-02-10T12:00:00.000Z",
  },
  {
    id: "9",
    uuid: "c9d0e1f2-a3b4-5678-2345-789012345678",
    filename: "bike-road.mp4",
    url: "https://cdn.coverr.co/videos/coverr-motorcycle-on-the-road-1578/1080p.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 6200000,
    altText: "Motorcycle on open road",
    title: "Motor Biking Video",
    uploadedBy: "1",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "10",
    uuid: "d0e1f2a3-b4c5-6789-3456-890123456789",
    filename: "trek-hike.mp4",
    url: "https://cdn.coverr.co/videos/coverr-hiking-in-the-mountains-4087/1080p.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 7100000,
    altText: "Hiking in the mountains",
    title: "Treks Video",
    uploadedBy: "1",
    createdAt: "2026-03-01T10:05:00.000Z",
    updatedAt: "2026-03-01T10:05:00.000Z",
  },
  {
    id: "11",
    uuid: "e1f2a3b4-c5d6-7890-4567-901234567890",
    filename: "backpack-woods.mp4",
    url: "https://cdn.coverr.co/videos/coverr-a-man-walking-in-the-woods-5634/1080p.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 5800000,
    altText: "Traveler walking through forest",
    title: "Backpacking Video",
    uploadedBy: "1",
    createdAt: "2026-03-01T10:10:00.000Z",
    updatedAt: "2026-03-01T10:10:00.000Z",
  },
  {
    id: "12",
    uuid: "f2a3b4c5-d6e7-8901-5678-012345678901",
    filename: "beach-aerial.mp4",
    url: "https://cdn.coverr.co/videos/coverr-tropical-beach-aerial-view-5631/1080p.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 6400000,
    altText: "Tropical beach aerial",
    title: "Custom Departures Video",
    uploadedBy: "1",
    createdAt: "2026-03-01T10:15:00.000Z",
    updatedAt: "2026-03-01T10:15:00.000Z",
  },
  {
    id: "13",
    uuid: "a3b4c5d6-e7f8-9012-6789-123456789012",
    filename: "thailand-beach.jpg",
    url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 290000,
    altText: "Thailand coastline",
    title: "Thailand",
    uploadedBy: "1",
    createdAt: "2026-03-02T08:00:00.000Z",
    updatedAt: "2026-03-02T08:00:00.000Z",
  },
  {
    id: "14",
    uuid: "b4c5d6e7-f8a9-0123-7890-234567890123",
    filename: "kerala-backwaters.jpg",
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=900&q=85",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 280000,
    altText: "Kerala backwaters",
    title: "Kerala",
    uploadedBy: "1",
    createdAt: "2026-03-02T08:05:00.000Z",
    updatedAt: "2026-03-02T08:05:00.000Z",
  },
  {
    id: "15",
    uuid: "c5d6e7f8-a9b0-1234-8901-345678901234",
    filename: "andaman.jpg",
    url: "https://images.unsplash.com/photo-1582967788600-e835f2582050?w=900&q=85",
    mimeType: "image/jpeg",
    mediaType: "image",
    size: 270000,
    altText: "Andaman islands",
    title: "Andaman",
    uploadedBy: "1",
    createdAt: "2026-03-02T08:10:00.000Z",
    updatedAt: "2026-03-02T08:10:00.000Z",
  },
];

const mediaStore = createPersistedStore("media-v2", SEED_MEDIA);

function generateId(): string {
  return String(Date.now() + Math.random()).replace(".", "");
}

export function getAllMedia(): MediaItem[] {
  return [...mediaStore.get()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getMediaById(id: string): MediaItem | null {
  return mediaStore.get().find((m) => m.id === id) ?? null;
}

export function createMedia(data: MediaUploadInput): MediaItem {
  const now = new Date().toISOString();
  const item: MediaItem = {
    id: generateId(),
    uuid: crypto.randomUUID(),
    filename: data.filename,
    url: data.url,
    mimeType: data.mimeType,
    mediaType: data.mediaType,
    size: data.size,
    altText: "",
    title: data.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    uploadedBy: data.uploadedBy,
    createdAt: now,
    updatedAt: now,
  };
  mediaStore.set([item, ...mediaStore.get()]);
  logActivity(`"${item.title}" uploaded to media library`, "media");
  return item;
}

export function updateMedia(
  id: string,
  data: { altText?: string; title?: string; url?: string; filename?: string }
): MediaItem {
  const items = mediaStore.get();
  const index = items.findIndex((m) => m.id === id);
  if (index === -1) throw new Error("Media not found");

  const updated: MediaItem = {
    ...items[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  mediaStore.set([
    ...items.slice(0, index),
    updated,
    ...items.slice(index + 1),
  ]);
  return updated;
}

export function deleteMedia(id: string): void {
  const items = mediaStore.get();
  const item = items.find((m) => m.id === id);
  if (!item) throw new Error("Media not found");
  mediaStore.set(items.filter((m) => m.id !== id));
  logActivity(`"${item.title}" removed from media library`, "media");
}

export function deleteMediaBulk(ids: string[]): void {
  mediaStore.set(mediaStore.get().filter((m) => !ids.includes(m.id)));
  logActivity(`${ids.length} media file(s) deleted`, "media");
}
