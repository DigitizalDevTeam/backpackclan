"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  createUserSchema,
  userFormSchema,
  type CreateUserValues,
  type UserFormValues,
} from "@/lib/validations/user";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { AdminUser } from "@/types/user";

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const router = useRouter();
  const isEdit = !!userId;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [originalRoleId, setOriginalRoleId] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserFormValues | CreateUserValues>({
    resolver: zodResolver(isEdit ? userFormSchema : createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      roleId: "",
      isActive: true,
      password: "",
    },
  });

  useUnsavedChanges(isDirty);

  useEffect(() => {
    async function loadRoles() {
      try {
        const res = await fetch("/api/admin/roles");
        const result = await res.json();
        if (result.success) {
          setRoles(result.data.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name })));
        }
      } catch {
        // roles optional in mock mode
      }
    }
    loadRoles();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadUser() {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const result = await res.json();
        if (result.success) {
          const user: AdminUser = result.data;
          reset({
            name: user.name,
            email: user.email,
            roleId: user.roleId ?? "",
            isActive: user.isActive,
            password: "",
          });
          setOriginalRoleId(user.roleId);
        } else {
          toast.error("User not found");
          router.push("/admin/users");
        }
      } catch {
        toast.error("Failed to load user");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId, reset, router]);

  async function onSubmit(data: UserFormValues | CreateUserValues) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/users/${userId}` : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        name: data.name,
        email: data.email,
        roleId: data.roleId,
        isActive: data.isActive,
        ...(data.password ? { password: data.password } : {}),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to save user");
        return;
      }

      if (isEdit) {
        const roleChanged = originalRoleId !== null && data.roleId !== originalRoleId;
        toast.success(
          roleChanged ? "Role updated successfully" : "User updated successfully"
        );
      } else {
        toast.success("User created successfully");
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      toast.error("Failed to save user");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit User" : "Add User"}
        description={
          isEdit
            ? "Update user details, role, and access status."
            : "Create a new admin panel user account."
        }
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="John Doe" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@backpackclan.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select
                    id="roleId"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                    {roles.length === 0 && (
                      <>
                        <option value="mock-admin">Admin</option>
                        <option value="mock-editor">Editor</option>
                        <option value="mock-viewer">Viewer</option>
                      </>
                    )}
                  </Select>
                )}
              />
              {errors.roleId && (
                <p className="text-sm text-destructive">
                  {errors.roleId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {isEdit && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEdit ? "••••••••" : "Min. 8 characters"}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                )}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active account
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/users">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
