"use client";

import { useCallback, useRef, useState } from "react";
import { FileUp, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { validateMediaFile } from "@/lib/media/utils";
import { cn } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (item: MediaItem) => void;
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: MediaUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File) => {
      const error = validateMediaFile(file);
      if (error) {
        toast.error(error);
        return;
      }

      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 12, 90));
      }, 150);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const result = await res.json();
        if (!res.ok || !result.success) {
          toast.error(result.errors?.form || "Upload failed");
          return;
        }

        toast.success("File uploaded successfully");
        onUploaded(result.data);
        onOpenChange(false);
      } catch {
        toast.error("Upload failed. Please try again.");
      } finally {
        clearInterval(progressInterval);
        setUploading(false);
        setProgress(0);
      }
    },
    [onOpenChange, onUploaded]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media</DialogTitle>
          <DialogDescription>
            Images up to 5 MB (JPEG, PNG, WebP, GIF). Videos: MP4 only.
          </DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors",
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          {uploading ? (
            <div className="w-full space-y-4 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-1 text-sm font-medium">
                Drag & drop a file here
              </p>
              <p className="mb-4 text-xs text-muted-foreground">or</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                <FileUp className="h-4 w-4" />
                Browse files
              </Button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,application/pdf"
                onChange={handleFileSelect}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
