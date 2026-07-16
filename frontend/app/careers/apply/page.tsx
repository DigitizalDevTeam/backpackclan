import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CareerLeadForm } from "@/components/leads/CareerLeadForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("careers_apply", {
    title: "Careers — Backpackclan",
    description: "Apply to join the Backpackclan team.",
  });
}

export default function CareersApplyPage() {
  return (
    <SitePageShell seoPageKey="careers_apply">
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
