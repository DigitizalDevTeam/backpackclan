"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/forms/MediaPicker";
import type { MediaItem } from "@/types/media";

interface MediaGalleryPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  disabled?: boolean;
  maxItems?: number;
}

function normalizeMediaIds(ids: string[]): string[] {
  return ids.map((id) => String(id));
}

function GalleryThumbnail({ item }: { item: MediaItem }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.url}
      alt={item.altText || item.title}
      className="h-full w-full object-cover"
    />
  );
}

async function fetchMediaItem(id: string): Promise<MediaItem | null> {
  try {
    const res = await fetch(`/api/admin/media/${id}`);
    const result = await res.json();
    return result.success ? (result.data as MediaItem) : null;
  } catch {
    return null;
  }
}

export function MediaGalleryPicker({
  value,
  onChange,
  label = "Gallery",
  disabled = false,
  maxItems = 12,
}: MediaGalleryPickerProps) {
  const [mediaMap, setMediaMap] = useState<Record<string, MediaItem>>({});
  const [loading, setLoading] = useState(false);

  const galleryIds = useMemo(() => normalizeMediaIds(value), [value]);

  const loadMedia = useCallback(async () => {
    if (galleryIds.length === 0) {
      setMediaMap({});
      return;
    }

    setLoading(true);
    try {
      const next: Record<string, MediaItem> = {};
      const idSet = new Set(galleryIds);

      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success) {
        for (const item of result.data as MediaItem[]) {
          const itemId = String(item.id);
          if (idSet.has(itemId)) {
            next[itemId] = item;
          }
        }
      }

      const missingIds = galleryIds.filter((id) => !next[id]);
      if (missingIds.length > 0) {
        const fetched = await Promise.all(missingIds.map(fetchMediaItem));
        for (const item of fetched) {
          if (item) {
            next[String(item.id)] = item;
          }
        }
      }

      setMediaMap(next);
    } finally {
      setLoading(false);
    }
  }, [galleryIds]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  function addImage(media: MediaItem | null) {
    if (!media) return;
    const mediaId = String(media.id);
    if (galleryIds.includes(mediaId) || galleryIds.length >= maxItems) return;
    setMediaMap((prev) => ({ ...prev, [mediaId]: media }));
    onChange([...galleryIds, mediaId]);
  }

  function removeImage(id: string) {
    const mediaId = String(id);
    onChange(galleryIds.filter((item) => item !== mediaId));
    setMediaMap((prev) => {
      const next = { ...prev };
      delete next[mediaId];
      return next;
    });
  }

  const canAdd = !disabled && galleryIds.length < maxItems;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">
          {galleryIds.length} / {maxItems} images
        </p>
      </div>

      {galleryIds.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-6">
          {canAdd ? (
            <div className="mx-auto flex max-w-xs flex-col items-center gap-3 text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-dashed bg-background">
                <MediaPicker
                  value={null}
                  onChange={addImage}
                  accept="image"
                  label="Add image"
                  compact
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Add up to {maxItems} gallery images
              </p>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No gallery images yet.
            </p>
          )}
        </div>
      ) : (
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {galleryIds.map((id, index) => {
            const item = mediaMap[id];

            return (
              <div
                key={id}
                className="relative isolate overflow-hidden rounded-lg border bg-card shadow-sm"
              >
                <div className="aspect-square bg-muted">
                  {item ? (
                    <GalleryThumbnail item={item} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                      <ImagePlus className="h-5 w-5 opacity-50" />
                      <span className="text-[10px]">
                        {loading ? "Loading..." : `Image ${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-0.5 border-t px-2 py-1.5">
                  <p className="truncate text-xs font-medium">
                    {item?.title ?? `Image ${index + 1}`}
                  </p>
                  {item?.filename ? (
                    <p className="truncate text-[10px] text-muted-foreground">
                      {item.filename}
                    </p>
                  ) : null}
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1.5 top-1.5 z-10 h-7 w-7 shadow-sm"
                    onClick={() => removeImage(id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}

          {canAdd && (
            <div className="relative isolate aspect-square overflow-hidden rounded-lg border border-dashed bg-muted/20">
              <MediaPicker
                value={null}
                onChange={addImage}
                accept="image"
                label="Add"
                compact
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
