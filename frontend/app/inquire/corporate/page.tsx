import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CorporateLeadForm } from "@/components/leads/CorporateLeadForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("inquire_corporate", {
    title: "Corporate inquiry — Backpackclan",
    description: "Corporate offsites and group expeditions with Backpackclan.",
  });
}

export default function CorporateInquirePage() {
  return (
    <SitePageShell seoPageKey="inquire_corporate">
      <PageHero
        badge="Corporate"
        title="Team trips that actually inspire"
        subtitle="From weekend offsites to multi-day incentive expeditions."
      />
      <section className="site-container py-16">
        <CorporateLeadForm />
      </section>
    </SitePageShell>
  );
}
