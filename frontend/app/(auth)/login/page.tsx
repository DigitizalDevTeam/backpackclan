import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterCta } from "@/components/auth/RegisterCta";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign In — Backpackclan",
  description: "Sign in to your Backpackclan account to manage bookings and trip inquiries.",
};

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Sign in to access your account, saved trips, and booking history."
      asideTitle="Your Himalayan adventure account"
      asidePoints={[
        "Track trip inquiries and booking status",
        "Save favorite destinations and packages",
        "Get early access to new batch announcements",
        "Receive member-only offers and travel tips",
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
        <LoginForm />
        <RegisterCta />
      </Suspense>
    </AuthPageLayout>
  );
}
