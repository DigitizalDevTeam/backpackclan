import type { Metadata } from "next";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password — Backpackclan",
  description: "Reset your Backpackclan account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset your password."
      asideTitle="Account recovery"
      asidePoints={[
        "Secure password reset via email",
        "Link expires after 24 hours for safety",
        "Contact support if you need help",
      ]}
    >
      <ForgotPasswordForm />
    </AuthPageLayout>
  );
}
