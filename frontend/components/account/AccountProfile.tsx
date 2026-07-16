"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import type { AuthUser } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordFormData,
  type UpdateProfileFormData,
} from "@/lib/validations/auth";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountProfile() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user ?? data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name,
      phone: user.phone ?? "",
    });
  }, [user, profileForm]);

  async function onProfileSubmit(data: UpdateProfileFormData) {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Update failed");
      }
      setUser(result.data.user);
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPasswordSubmit(data: ChangePasswordFormData) {
    setSavingPassword(true);
    try {
      const res = await fetch("/api/customer/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.errors?.form || "Password change failed");
      }
      passwordForm.reset();
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password change failed");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground">Unable to load profile.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account details and password.
        </p>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-4 border-b pb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-teal-100 text-lg text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.roleName ?? "Customer"}</p>
          </div>
        </div>

        <form
          onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          className="mt-6 space-y-5"
        >
          <h3 className="font-semibold">Contact information</h3>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" value={user.email} disabled className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" className="pl-9" {...profileForm.register("name")} />
            </div>
            {profileForm.formState.errors.name ? (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" className="pl-9" {...profileForm.register("phone")} />
            </div>
            {profileForm.formState.errors.phone ? (
              <p className="text-sm text-destructive">
                {profileForm.formState.errors.phone.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save profile"
            )}
          </Button>
        </form>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-5"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Change password</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...passwordForm.register("currentPassword")}
            />
            {passwordForm.formState.errors.currentPassword ? (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("newPassword")}
            />
            {passwordForm.formState.errors.newPassword ? (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...passwordForm.register("confirmPassword")}
            />
            {passwordForm.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" variant="outline" disabled={savingPassword}>
            {savingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
