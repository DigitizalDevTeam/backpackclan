"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { cn } from "@/lib/utils";
import type { MediaItem, MediaType } from "@/types/media";
import { FileText, Film } from "lucide-react";

interface MediaPickerProps {
  value?: string | null;
  onChange: (media: MediaItem | null) => void;
  accept?: MediaType | "all";
  label?: string;
  disabled?: boolean;
  /** Small tile trigger only — no preview card (for galleries, grids). */
  compact?: boolean;
}

function PickerThumbnail({ item }: { item: MediaItem }) {
  if (item.mediaType === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={item.altText || item.title}
        className="h-full w-full object-cover"
      />
    );
  }
  if (item.mediaType === "video") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <Film className="h-6 w-6 text-white/70" />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <FileText className="h-6 w-6 text-muted-foreground" />
    </div>
  );
}

export function MediaPicker({
  value,
  onChange,
  accept = "image",
  label = "Select media",
  disabled = false,
  compact = false,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success) {
        let data: MediaItem[] = result.data;
        if (accept !== "all") {
          data = data.filter((m: MediaItem) => m.mediaType === accept);
        }
        setItems(data);
      }
    } finally {
      setLoading(false);
    }
  }, [accept]);

  useEffect(() => {
    if (open) fetchMedia();
  }, [open, fetchMedia]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    async function loadSelected() {
      const res = await fetch(`/api/admin/media/${value}`);
      const result = await res.json();
      if (result.success) setSelected(result.data);
    }
    loadSelected();
  }, [value]);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.filename.toLowerCase().includes(search.toLowerCase())
  );

  const preview = value
    ? items.find((m) => m.id === value) ?? selected
    : null;

  function handleConfirm() {
    onChange(selected);
    if (!value) {
      setSelected(null);
    }
    setOpen(false);
  }

  const pickerDialog = (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected(null);
      }}
    >
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{label || "Select media"}</DialogTitle>
          <DialogDescription>
            Choose from your media library
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <LoadingSkeleton variant="cards" />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={cn(
                    "overflow-hidden rounded-lg border text-left transition-all hover:shadow-md",
                    selected?.id === item.id && "ring-2 ring-primary"
                  )}
                >
                  <div className="aspect-square">
                    <PickerThumbnail item={item} />
                  </div>
                  <p className="truncate p-1.5 text-xs font-medium">
                    {item.title}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (compact) {
    return (
      <div className="relative h-full min-h-[5rem] w-full">
        <Button
          type="button"
          variant="ghost"
          className="h-full min-h-[5rem] w-full flex-col gap-1.5 rounded-lg border-0 shadow-none hover:bg-muted/50"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <ImagePlus className="h-6 w-6 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label || "Add"}</span>
        </Button>
        {pickerDialog}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <PickerThumbnail item={preview} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{preview.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {preview.filename}
            </p>
          </div>
          {!disabled && (
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-24 border-dashed"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <ImagePlus className="h-5 w-5" />
          {label}
        </Button>
      )}

      {pickerDialog}
    </div>
  );
}
