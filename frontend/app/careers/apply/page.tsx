import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CareerLeadForm } from "@/components/leads/CareerLeadForm";

export const metadata: Metadata = {
  title: "Careers — Backpackclan",
  description: "Apply to join the Backpackclan team.",
};

export default function CareersApplyPage() {
  return (
    <SitePageShell seoPageKey="contact">
      <PageHero
        badge="Careers"
        title="Work where the trails lead"
        subtitle="Guides, ops, and storytellers — apply below."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CareerLeadForm />
      </section>
    </SitePageShell>
  );
}
