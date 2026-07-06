"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/validations/user";
import type { AuthUser } from "@/types/auth";

interface ChangePasswordFormProps {
  user: AuthUser;
}

export function ChangePasswordForm({ user }: ChangePasswordFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");
      reset();
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account settings and password."
      />

      <Card className="max-w-2xl">
        <CardContent className="pt-6 space-y-6">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-muted-foreground">
              Role: {user.role}
            </p>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-base font-semibold">Change Password</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
