import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy — Backpackclan",
  description: "How Backpackclan collects, uses, and protects your personal information.",
};

const sections = [
  {
    title: "Information we collect",
    body: "We collect information you provide when booking trips, submitting inquiries, or creating an account — including name, email, phone number, travel preferences, and payment details. We also collect usage data through cookies and analytics to improve our website.",
  },
  {
    title: "How we use your information",
    body: "Your data is used to process bookings, send trip confirmations and updates, respond to inquiries, improve our services, and — with your consent — share offers and travel tips. We do not sell your personal information to third parties.",
  },
  {
    title: "Data sharing",
    body: "We share necessary details with trip partners (hotels, transport operators, guides) to fulfill your booking. Payment processing is handled by certified payment gateways. We may disclose information if required by law.",
  },
  {
    title: "Data security",
    body: "We implement industry-standard security measures including SSL encryption, access controls, and regular security audits. No method of transmission over the internet is 100% secure, but we strive to protect your data.",
  },
  {
    title: "Your rights",
    body: "You may request access, correction, or deletion of your personal data by contacting hello@backpackclan.com. You can opt out of marketing emails at any time using the unsubscribe link in our messages.",
  },
  {
    title: "Contact",
    body: "For privacy-related questions, email hello@backpackclan.com or write to Backpackclan, Mumbai, Maharashtra, India.",
  },
];

export default function PrivacyPage() {
  return (
    <SitePageShell>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="Last updated: January 2026"
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-10 text-muted-foreground">
          Backpackclan (&quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy
          explains how we handle your personal information when you use our website and services.
        </p>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold">
                {i + 1}. {section.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </SitePageShell>
  );
}
