"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ExternalLink,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { HomepageSection, HomepageSectionType } from "@/types/homepage";
import type { UserRole } from "@/types/auth";

interface HomepageSectionListProps {
  userRole: UserRole;
}

function SortableRow({
  section,
  readOnly,
  onToggle,
}: {
  section: HomepageSection;
  readOnly: boolean;
  onToggle: (slug: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-shadow",
        isDragging && "shadow-lg z-10",
        !section.isEnabled && "opacity-60"
      )}
    >
      {!readOnly && (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
        {section.sortOrder + 1}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium">{section.title}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {section.type.replace(/_/g, " ")}
        </p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={section.isEnabled}
          disabled={readOnly}
          onChange={() => onToggle(section.slug)}
          className="h-4 w-4 rounded accent-primary"
        />
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {section.isEnabled ? "Enabled" : "Disabled"}
        </span>
      </label>

      <Button variant="outline" size="sm" asChild>
        <Link href={`/admin/homepage/sections/${section.slug}`}>
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </Button>
    </div>
  );
}

function slugifyTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function HomepageSectionList({ userRole }: HomepageSectionListProps) {
  const readOnly = userRole === "viewer";
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newType, setNewType] = useState<HomepageSectionType>("category_showcase");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchSections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/homepage/sections");
      const result = await res.json();
      if (result.success) setSections(result.data);
      else toast.error("Failed to load sections");
    } catch {
      toast.error("Failed to load sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    try {
      const res = await fetch("/api/admin/homepage/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((s) => s.id) }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to save order");
        fetchSections();
        return;
      }
      setSections(result.data);
      toast.success("Homepage order saved");
    } catch {
      toast.error("Failed to save order");
      fetchSections();
    }
  }

  async function handleCreateSection() {
    const title = newTitle.trim();
    const slug = (newSlug.trim() || slugifyTitle(title)).trim();
    if (!title || !slug) {
      toast.error("Enter a section title");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/homepage/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, type: newType }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form ?? "Could not create section");
      }
      setSections((prev) => [...prev, result.data].sort((a, b) => a.sortOrder - b.sortOrder));
      toast.success("Homepage section created");
      setCreateOpen(false);
      setNewTitle("");
      setNewSlug("");
      setNewType("category_showcase");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create section");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(slug: string) {
    try {
      const res = await fetch(`/api/admin/homepage/sections/${slug}`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update section");
        return;
      }
      setSections((prev) =>
        prev.map((s) => (s.slug === slug ? result.data : s))
      );
      toast.success(
        result.data.isEnabled ? "Section enabled" : "Section disabled"
      );
    } catch {
      toast.error("Failed to update section");
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  const enabledCount = sections.filter((s) => s.isEnabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Manager"
        description="Enable, disable, and reorder homepage sections. Edit each section's content individually."
        action={
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {enabledCount}/{sections.length} enabled
            </Badge>
            {!readOnly ? (
              <Button type="button" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add section
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href="/preview/homepage" target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
            </Button>
          </div>
        }
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add homepage section</DialogTitle>
            <DialogDescription>
              Create a new category row, featured trips block, or popular destinations section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="section-type">Section type</Label>
              <Select
                id="section-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as HomepageSectionType)}
              >
                <option value="category_showcase">Category row (Motor Biking, Backpacking, etc.)</option>
                <option value="popular_trips">Featured trips</option>
                <option value="featured_destinations">Popular destinations</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (!newSlug.trim()) {
                    setNewSlug(slugifyTitle(e.target.value));
                  }
                }}
                placeholder="e.g. International Trips"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section-slug">Slug</Label>
              <Input
                id="section-slug"
                value={newSlug}
                onChange={(e) => setNewSlug(slugifyTitle(e.target.value))}
                placeholder="international-trips"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={creating}
              onClick={handleCreateSection}
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create section
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                readOnly={readOnly}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
