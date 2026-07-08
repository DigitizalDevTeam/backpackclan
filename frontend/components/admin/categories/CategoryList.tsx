"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import type { Category } from "@/types/category";
import type { AuthUser } from "@/types/auth";

interface CategoryListProps {
  user: AuthUser;
}

export function CategoryList({ user }: CategoryListProps) {
  const canCreate = hasPermission(user, "categories.create");
  const canUpdate = hasPermission(user, "categories.update");
  const canDelete = hasPermission(user, "categories.delete");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const result = await res.json();
      if (result.success) setCategories(result.data);
      else toast.error("Failed to load categories");
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q)
    );
  }, [categories, search]);

  async function handleToggle(category: Category) {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update status");
        return;
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? result.data : c))
      );
      toast.success(
        result.data.isActive ? "Category activated" : "Category deactivated"
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to delete category");
        return;
      }
      toast.success("Category deleted");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip Categories"
        description="Organize trips into categories like Bike Tours, Treks, and Group Tours."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus className="h-4 w-4" />
                Add Category
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No categories found"
          description={
            search
              ? "Try adjusting your search."
              : "Create your first trip category to organize travel products."
          }
          action={
            canCreate && !search ? (
              <Button asChild>
                <Link href="/admin/categories/new">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Parent
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Trips
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        /{category.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {category.parentId
                        ? categoryMap.get(category.parentId)?.name ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {category.tripCount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={category.isActive ? "success" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={category.isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggle(category)}
                          >
                            {category.isActive ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/categories/${category.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(category)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
