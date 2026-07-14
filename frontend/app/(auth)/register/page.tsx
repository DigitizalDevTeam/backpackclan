import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Create Account — Backpackclan",
  description: "Create your Backpackclan traveler account to book trips and track inquiries.",
};

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Create your account"
      subtitle="Join Backpackclan to save trips, manage bookings, and unlock exclusive offers."
      asideTitle="Start your journey with us"
      asidePoints={[
        "Join 12,000+ happy Himalayan travelers",
        "Book bike tours, treks & group adventures",
        "Get personalized trip recommendations",
        "Access deals before they go public",
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
        <RegisterForm />
      </Suspense>
    </AuthPageLayout>
  );
}
