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
    url: "https://images.unsplash.com/photo-1593693397690-362cb1aeb21d?w=800&q=80",
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
    filename: "bike-tour-promo.mp4",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    mimeType: "video/mp4",
    mediaType: "video",
    size: 2500000,
    altText: "Motorcycle tour promotional video",
    title: "Bike Tour Promo",
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
];

const mediaStore = createPersistedStore("media", SEED_MEDIA);

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
