"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mountain } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.errors?.email ?? "Failed to send reset link");
        return;
      }
      setSubmitted(true);
      toast.success("Reset link sent! Check your email inbox.");
    } catch {
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Mountain className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Backpackclan</h1>
          <p className="mt-1 text-sm text-slate-400">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password</CardTitle>
            <CardDescription>
              {submitted
                ? `We've sent a password reset link to ${getValues("email")}`
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>

          {!submitted ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@backpackclan.com"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
