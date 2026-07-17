"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
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
import { formatDate } from "@/lib/site/format";
import type { BlogPost } from "@/types/blog";
import type { AuthUser } from "@/types/auth";

interface BlogListProps {
  user: AuthUser;
}

export function BlogList({ user }: BlogListProps) {
  const canCreate = hasPermission(user, "blogs.create");
  const canUpdate = hasPermission(user, "blogs.update");
  const canDelete = hasPermission(user, "blogs.delete");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blogs");
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPosts(result.data);
      } else {
        toast.error(result.errors?.form ?? "Failed to load blog posts");
      }
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  async function handleToggle(post: BlogPost) {
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update status");
        return;
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? result.data : p))
      );
      toast.success(
        result.data.status === "published" ? "Post published" : "Post moved to draft"
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to delete post");
        return;
      }
      toast.success("Blog post deleted");
      setDeleteTarget(null);
      fetchPosts();
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description="Create and manage travel guides, tips, and stories for the public blog."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/blogs/new">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "published" | "draft")
          }
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No blog posts found"
          description={
            search || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Write your first travel article to populate the blog."
          }
          action={
            canCreate && !search && statusFilter === "all" ? (
              <Button asChild>
                <Link href="/admin/blogs/new">
                  <Plus className="h-4 w-4" />
                  New Post
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
                    Post
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Published
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
                {filtered.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        /blog/{post.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {post.category}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={post.status === "published" ? "success" : "secondary"}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {post.status === "published" && (
                          <Button variant="ghost" size="icon" asChild title="View on site">
                            <Link href={`/blog/${post.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              post.status === "published"
                                ? "Move to draft"
                                : "Publish"
                            }
                            onClick={() => handleToggle(post)}
                          >
                            {post.status === "published" ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/blogs/${post.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(post)}
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
        title="Delete blog post"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
