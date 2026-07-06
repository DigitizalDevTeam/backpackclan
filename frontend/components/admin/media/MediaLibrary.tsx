"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Film,
  Grid3X3,
  Image as ImageIcon,
  LayoutList,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { MediaUploadDialog } from "@/components/admin/media/MediaUploadDialog";
import { MediaDetailPanel } from "@/components/admin/media/MediaDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/lib/media/utils";
import { cn } from "@/lib/utils";
import type { MediaItem, MediaType } from "@/types/media";
import type { UserRole } from "@/types/auth";

interface MediaLibraryProps {
  userRole: UserRole;
}

function MediaThumbnail({ item }: { item: MediaItem }) {
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
        <Film className="h-8 w-8 text-white/70" />
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <FileText className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

export function MediaLibrary({ userRole }: MediaLibraryProps) {
  const readOnly = userRole === "viewer";
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const result = await res.json();
      if (result.success) setItems(result.data);
      else toast.error("Failed to load media");
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.filename.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.altText.toLowerCase().includes(q);
      const matchesType = typeFilter === "all" || item.mediaType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, search, typeFilter]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleItemClick(item: MediaItem) {
    setActiveItem(item);
  }

  function handleUploaded(item: MediaItem) {
    setItems((prev) => [item, ...prev]);
    setActiveItem(item);
  }

  function handleUpdated(item: MediaItem) {
    setItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    setActiveItem(item);
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((m) => m.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (activeItem?.id === id) setActiveItem(null);
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to delete");
        return;
      }
      toast.success(`${selected.size} file(s) deleted successfully`);
      setItems((prev) => prev.filter((m) => !selected.has(m.id)));
      if (activeItem && selected.has(activeItem.id)) setActiveItem(null);
      setSelected(new Set());
      setBulkDeleteOpen(false);
    } catch {
      toast.error("Failed to delete files");
    } finally {
      setBulkDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Manager"
        description="Upload, organize, and manage images and videos for your travel portal."
        action={
          !readOnly ? (
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MediaType | "all")}
            className="w-full sm:w-36"
          >
            <option value="all">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && selected.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selected.size})
            </Button>
          )}
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className={cn("grid gap-6", activeItem && "lg:grid-cols-3")}>
        <div className={cn(activeItem && "lg:col-span-2")}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<ImageIcon className="h-6 w-6" />}
              title="No media found"
              description={
                search || typeFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Upload your first image or video to get started."
              }
              action={
                !readOnly && !search && typeFilter === "all" ? (
                  <Button onClick={() => setUploadOpen(true)}>
                    <Upload className="h-4 w-4" />
                    Upload Media
                  </Button>
                ) : undefined
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md",
                    activeItem?.id === item.id && "ring-2 ring-primary",
                    selected.has(item.id) && "ring-2 ring-primary/60"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="aspect-square overflow-hidden">
                    <MediaThumbnail item={item} />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                  {!readOnly && (
                    <div
                      className="absolute left-2 top-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {!readOnly && <th className="w-10 px-4 py-3" />}
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      File
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "cursor-pointer hover:bg-muted/30 transition-colors",
                        activeItem?.id === item.id && "bg-muted/50"
                      )}
                      onClick={() => handleItemClick(item)}
                    >
                      {!readOnly && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="h-4 w-4 rounded accent-primary"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                            <MediaThumbnail item={item} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {item.filename}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <Badge variant="secondary" className="capitalize">
                          {item.mediaType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {activeItem && (
          <div className="lg:col-span-1">
            <MediaDetailPanel
              item={activeItem}
              readOnly={readOnly}
              onClose={() => setActiveItem(null)}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          </div>
        )}
      </div>

      <MediaUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={handleUploaded}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete selected files"
        description={`Are you sure you want to delete ${selected.size} file(s)? This cannot be undone.`}
        confirmLabel="Delete all"
        variant="destructive"
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
