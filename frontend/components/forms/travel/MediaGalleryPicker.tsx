"use client";

import { Plus, X } from "lucide-react";
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

export function MediaGalleryPicker({
  value,
  onChange,
  label = "Gallery",
  disabled = false,
  maxItems = 12,
}: MediaGalleryPickerProps) {
  function addImage(media: MediaItem | null) {
    if (!media || value.includes(media.id) || value.length >= maxItems) return;
    onChange([...value, media.id]);
  }

  function removeImage(id: string) {
    onChange(value.filter((item) => item !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {!disabled && value.length < maxItems && (
          <MediaPicker
            value={null}
            onChange={addImage}
            accept="image"
            label=""
          />
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gallery images yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {value.map((id) => (
            <div
              key={id}
              className="relative flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-xs text-muted-foreground"
            >
              #{id}
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6"
                  onClick={() => removeImage(id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {!disabled && value.length < maxItems && (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed">
              <MediaPicker
                value={null}
                onChange={addImage}
                accept="image"
                label=""
              />
            </div>
          )}
        </div>
      )}

      {!disabled && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Plus className="h-3 w-3" />
          Add up to {maxItems} images
        </p>
      )}
    </div>
  );
}
