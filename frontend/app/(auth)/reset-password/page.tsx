import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Reset Password — Backpackclan",
  description: "Set a new password for your Backpackclan account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthPageLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      asideTitle="Secure your account"
      asidePoints={[
        "Use at least 8 characters",
        "Mix letters, numbers, and symbols",
        "Do not reuse passwords from other sites",
      ]}
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthPageLayout>
  );
}
