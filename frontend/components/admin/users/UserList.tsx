"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import type { AdminUser } from "@/types/user";
import type { UserRole } from "@/types/auth";

const roleBadgeVariant: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
};

export function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const result = await res.json();
      if (result.success) setUsers(result.data);
      else toast.error("Failed to load users");
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to delete user");
        return;
      }
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(user: AdminUser) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...user,
          isActive: !user.isActive,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to update status");
        return;
      }
      toast.success(
        user.isActive ? "User deactivated" : "User activated successfully"
      );
      fetchUsers();
    } catch {
      toast.error("Failed to update status");
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage admin users, roles, and access permissions."
        action={
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4" />
              Add User
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | "all")}
          className="w-full sm:w-40"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            search || roleFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first admin user."
          }
          action={
            !search && roleFilter === "all" ? (
              <Button asChild>
                <Link href="/admin/users/new">
                  <Plus className="h-4 w-4" />
                  Add User
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
                    User
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={roleBadgeVariant[user.role]}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={user.isActive ? "success" : "secondary"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={user.isActive ? "Deactivate" : "Activate"}
                          onClick={() => toggleStatus(user)}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-amber-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        title="Delete user"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
