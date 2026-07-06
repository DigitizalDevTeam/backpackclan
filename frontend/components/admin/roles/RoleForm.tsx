"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { roleFormSchema, type RoleFormValues } from "@/lib/validations/user";
import type { PermissionGroup } from "@/types/role";

interface PermissionMatrixProps {
  groups: PermissionGroup[];
  value: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionMatrix({
  groups,
  value,
  onChange,
  disabled = false,
}: PermissionMatrixProps) {
  function toggle(slug: string) {
    if (disabled) return;
    onChange(
      value.includes(slug)
        ? value.filter((p) => p !== slug)
        : [...value, slug]
    );
  }

  function toggleGroup(slugs: string[]) {
    if (disabled) return;
    const allSelected = slugs.every((s) => value.includes(s));
    if (allSelected) {
      onChange(value.filter((p) => !slugs.includes(p)));
    } else {
      onChange([...new Set([...value, ...slugs])]);
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const slugs = group.permissions.map((p) => p.slug);
        const selectedCount = slugs.filter((s) => value.includes(s)).length;

        return (
          <div key={group.group} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold capitalize">{group.group}</h4>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => toggleGroup(slugs)}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedCount === slugs.length ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.permissions.map((perm) => (
                <label
                  key={perm.id}
                  className={cn(
                    "flex items-start gap-2 rounded-md border p-3 text-sm transition-colors",
                    value.includes(perm.slug) && "border-primary bg-primary/5",
                    disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(perm.slug)}
                    onChange={() => toggle(perm.slug)}
                    disabled={disabled}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="font-medium">{perm.name}</span>
                    {perm.description && (
                      <span className="block text-xs text-muted-foreground">
                        {perm.description}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RoleFormProps {
  roleId?: string;
  readOnly?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RoleForm({ roleId, readOnly = false, onSuccess, onCancel }: RoleFormProps) {
  const isEdit = !!roleId;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [isSystem, setIsSystem] = useState(false);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      permissions: [],
    },
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = form;
  const permissions = watch("permissions");

  const fetchPermissions = useCallback(async () => {
    const res = await fetch("/api/admin/permissions");
    const result = await res.json();
    if (result.success) setPermissionGroups(result.data);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        await fetchPermissions();
        if (roleId) {
          const res = await fetch(`/api/admin/roles/${roleId}`);
          const result = await res.json();
          if (result.success) {
            const role = result.data;
            setIsSystem(role.isSystem);
            reset({
              name: role.name,
              slug: role.slug,
              description: role.description ?? "",
              permissions: role.permissions ?? [],
            });
          } else {
            toast.error("Role not found");
            onCancel();
          }
        }
      } catch {
        toast.error("Failed to load role data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roleId, reset, fetchPermissions, onCancel]);

  async function onSubmit(data: RoleFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/roles/${roleId}` : "/api/admin/roles";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || Object.values(result.errors ?? {})[0] || "Failed to save role");
        return;
      }
      toast.success(isEdit ? "Role updated successfully" : "Role created successfully");
      onSuccess();
    } catch {
      toast.error("Failed to save role");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Role name</Label>
          <Input {...register("name")} disabled={readOnly} placeholder="Content Manager" />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input {...register("slug")} disabled={readOnly || isSystem} placeholder="content-manager" />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...register("description")} disabled={readOnly} placeholder="Optional description" />
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <Controller
          name="permissions"
          control={control}
          render={({ field }) => (
            <PermissionMatrix
              groups={permissionGroups}
              value={field.value}
              onChange={field.onChange}
              disabled={readOnly}
            />
          )}
        />
        {errors.permissions && (
          <p className="text-sm text-destructive">{errors.permissions.message}</p>
        )}
      </div>

      {!readOnly && (
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Update Role" : "Create Role"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </form>
  );
}
