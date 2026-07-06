"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminRole } from "@/types/role";

export function RoleList() {
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const result = await res.json();
      if (result.success) setRoles(result.data);
      else toast.error(result.errors?.form || "Failed to load roles");
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/roles/${deleteTarget.id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to delete role");
        return;
      }
      toast.success("Role deleted successfully");
      setDeleteTarget(null);
      fetchRoles();
    } catch {
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Create custom roles and assign granular permissions to control admin access."
        action={
          <Button asChild>
            <Link href="/admin/roles/new">
              <Plus className="h-4 w-4" />
              Create Role
            </Link>
          </Button>
        }
      />

      {roles.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-6 w-6" />}
          title="No roles yet"
          description="Create your first custom role and assign permissions."
          action={
            <Button asChild>
              <Link href="/admin/roles/new">Create Role</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{role.name}</CardTitle>
                  {role.isSystem && <Badge variant="secondary">System</Badge>}
                </div>
                <p className="text-xs text-muted-foreground font-mono">{role.slug}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {role.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                )}
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>{role.permissions?.length ?? 0} permissions</span>
                  <span>{role.userCount ?? 0} users</span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" asChild>
                    <Link href={`/admin/roles/${role.id}`}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  {!role.isSystem && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(role)}
                      aria-label="Delete role"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete role"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
