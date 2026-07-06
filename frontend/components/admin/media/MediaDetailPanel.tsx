"use client";

import { useEffect, useRef, useState } from "react";
import {
  Copy,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatFileSize } from "@/lib/media/utils";
import type { MediaItem } from "@/types/media";

interface MediaDetailPanelProps {
  item: MediaItem;
  readOnly?: boolean;
  onClose: () => void;
  onUpdated: (item: MediaItem) => void;
  onDeleted: (id: string) => void;
}

export function MediaDetailPanel({
  item,
  readOnly = false,
  onClose,
  onUpdated,
  onDeleted,
}: MediaDetailPanelProps) {
  const [title, setTitle] = useState(item.title);
  const [altText, setAltText] = useState(item.altText);
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const replaceRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(item.title);
    setAltText(item.altText);
  }, [item]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, altText }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to save");
        return;
      }
      toast.success("Media details updated");
      onUpdated(result.data);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setReplacing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "PUT",
        body: formData,
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to replace file");
        return;
      }
      toast.success("File replaced successfully");
      onUpdated(result.data);
    } catch {
      toast.error("Failed to replace file");
    } finally {
      setReplacing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to delete");
        return;
      }
      toast.success("Media deleted");
      onDeleted(item.id);
      setShowDelete(false);
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success("URL copied to clipboard");
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">File Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          {item.mediaType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.altText || item.title}
              className="h-full w-full object-cover"
            />
          ) : item.mediaType === "video" ? (
            <video src={item.url} controls className="h-full w-full" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="h-12 w-12" />
              <span className="text-sm">{item.filename}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium truncate">{item.filename}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {item.mediaType === "image" && <ImageIcon className="mr-1 h-3 w-3" />}
              {item.mediaType === "video" && <Film className="mr-1 h-3 w-3" />}
              {item.mediaType === "document" && <FileText className="mr-1 h-3 w-3" />}
              {item.mediaType}
            </Badge>
            <Badge variant="outline">{formatFileSize(item.size)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Uploaded{" "}
            {new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {!readOnly && (
          <>
            <div className="space-y-2">
              <Label htmlFor="media-title">Title</Label>
              <Input
                id="media-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="media-alt">Alt text</Label>
              <Input
                id="media-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe this media for accessibility"
              />
            </div>

            <div className="space-y-2">
              <Label>File URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={item.url.slice(0, 60) + (item.url.length > 60 ? "..." : "")}
                  className="text-xs"
                />
                <Button variant="outline" size="icon" onClick={copyUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Details"
                )}
              </Button>
              <Button
                variant="outline"
                disabled={replacing}
                onClick={() => replaceRef.current?.click()}
              >
                {replacing ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Replace
              </Button>
              <input
                ref={replaceRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf"
                onChange={handleReplace}
              />
              <Button
                variant="destructive"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </>
        )}

        {readOnly && (
          <Button variant="outline" className="w-full" onClick={copyUrl}>
            <Copy className="h-4 w-4" />
            Copy URL
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete media"
        description={`Are you sure you want to delete "${item.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
