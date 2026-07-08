"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { MenuItemDialog } from "@/components/admin/menus/MenuItemDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FlatMenuItem, Menu, MenuItem } from "@/types/menu";
import type { MenuItemFormValues } from "@/lib/validations/menu";
import type { UserRole } from "@/types/auth";
import { buildMenuTree, flattenMenuTree } from "@/lib/menu/tree";

interface MenuEditorProps {
  menuId: string;
  userRole: UserRole;
}

interface SortableRowProps {
  item: FlatMenuItem;
  readOnly: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggle: (item: MenuItem) => void;
}

function SortableRow({
  item,
  readOnly,
  onEdit,
  onDelete,
  onToggle,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: readOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 transition-shadow",
        isDragging && "shadow-lg z-10 opacity-90",
        !item.isActive && "opacity-60"
      )}
    >
      {!readOnly && (
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <div
        className="flex-1 min-w-0"
        style={{ paddingLeft: `${item.depth * 20}px` }}
      >
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{item.label}</p>
          {item.icon && (
            <Badge variant="outline" className="text-[10px]">
              {item.icon}
            </Badge>
          )}
          {!item.isActive && (
            <Badge variant="secondary" className="text-[10px]">
              Hidden
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{item.url}</p>
      </div>

      {!readOnly && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onToggle(item)}
          >
            {item.isActive ? (
              <Eye className="h-4 w-4 text-emerald-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function MenuEditor({ menuId, userRole }: MenuEditorProps) {
  const router = useRouter();
  const readOnly = userRole === "viewer";
  const [menu, setMenu] = useState<Menu | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [flatItems, setFlatItems] = useState<FlatMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const refreshFlat = useCallback((list: MenuItem[]) => {
    const tree = buildMenuTree(list);
    setFlatItems(flattenMenuTree(tree));
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/menus/${menuId}`);
      const result = await res.json();
      if (!result.success) {
        toast.error("Menu not found");
        router.push("/admin/menus");
        return;
      }
      setMenu(result.data.menu);
      setItems(result.data.items);
      setFlatItems(result.data.flat);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [menuId, router]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = flatItems.find((i) => i.id === active.id);
    const overItem = flatItems.find((i) => i.id === over.id);
    if (!activeItem || !overItem || activeItem.parentId !== overItem.parentId) {
      toast.error("Items can only be reordered within the same level");
      return;
    }

    const siblings = flatItems.filter((i) => i.parentId === activeItem.parentId);
    const oldIndex = siblings.findIndex((i) => i.id === active.id);
    const newIndex = siblings.findIndex((i) => i.id === over.id);
    const orderedIds = arrayMove(
      siblings.map((s) => s.id),
      oldIndex,
      newIndex
    );

    try {
      const res = await fetch(`/api/admin/menus/${menuId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: activeItem.parentId,
          orderedIds,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to save order");
        return;
      }
      setItems(result.data);
      refreshFlat(result.data);
      toast.success("Menu order saved");
    } catch {
      toast.error("Failed to save order");
    }
  }

  async function handleSaveItem(values: MenuItemFormValues) {
    const url = editingItem
      ? `/api/admin/menus/${menuId}/items/${editingItem.id}`
      : `/api/admin/menus/${menuId}/items`;
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = await res.json();
    if (!res.ok || !result.success) {
      toast.error(result.errors?.form || "Failed to save item");
      throw new Error("save failed");
    }

    toast.success(editingItem ? "Menu item updated" : "Menu item added");
    setDialogOpen(false);
    setEditingItem(null);
    await fetchMenu();
  }

  async function handleToggle(item: MenuItem) {
    try {
      const res = await fetch(`/api/admin/menus/${menuId}/items/${item.id}`, {
        method: "PATCH",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update visibility");
        return;
      }
      toast.success(
        result.data.isActive ? "Menu item enabled" : "Menu item disabled"
      );
      await fetchMenu();
    } catch {
      toast.error("Failed to update visibility");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/menus/${menuId}/items/${deleteTarget.id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to delete item");
        return;
      }
      const childMsg =
        result.data.deletedChildren > 0
          ? ` and ${result.data.deletedChildren} child item(s)`
          : "";
      toast.success(`Menu item deleted${childMsg}`);
      setDeleteTarget(null);
      await fetchMenu();
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSyncDestinations() {
    const parent = items.find(
      (i) => i.menuId === menuId && i.label === "Destinations" && i.parentId === null
    );
    if (!parent) {
      toast.error('Add a top-level "Destinations" menu item first');
      return;
    }
    try {
      const res = await fetch(`/api/admin/menus/${menuId}/sync-destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_destinations", parentItemId: parent.id }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Sync failed");
        return;
      }
      toast.success("Destination links synced from published destinations");
      await fetchMenu();
    } catch {
      toast.error("Sync failed");
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  const deleteChildCount = deleteTarget
    ? items.filter((i) => i.parentId === deleteTarget.id).length
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={menu?.name ?? "Menu Editor"}
        description="Drag to reorder items. Nest items by setting a parent when adding or editing."
        action={
          <div className="flex gap-2">
            {!readOnly && (
              <>
                <Button variant="outline" onClick={handleSyncDestinations}>
                  Sync Destinations
                </Button>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/menus">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {flatItems.length === 0 ? (
        <EmptyState
          title="No menu items"
          description="Add your first navigation link to get started."
          action={
            !readOnly ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={flatItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {flatItems.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  readOnly={readOnly}
                  onEdit={(i) => {
                    setEditingItem(i);
                    setDialogOpen(true);
                  }}
                  onDelete={setDeleteTarget}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <MenuItemDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        items={items}
        onSubmit={handleSaveItem}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete menu item"
        description={
          deleteChildCount > 0
            ? `"${deleteTarget?.label}" has ${deleteChildCount} child item(s) that will also be deleted. Continue?`
            : `Are you sure you want to delete "${deleteTarget?.label}"?`
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
