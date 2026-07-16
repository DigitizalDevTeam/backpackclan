"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthHomePath } from "@/lib/auth/user-kind";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import type { AuthUser } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.errors?.form || "Invalid email or password");
        return;
      }

      const user = result.data.user as AuthUser;
      toast.success(`Welcome back, ${user.name}!`);
      const redirect =
        searchParams.get("redirect") || getAuthHomePath(user);
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === "true" ? (
        <div className="rounded-xl border border-dashed bg-slate-50 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Demo customer</p>
          <p>customer@demo.com / password</p>
          <p className="mt-2 font-medium text-foreground">Demo staff (admin)</p>
          <p>admin@backpackclan.com / password</p>
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
