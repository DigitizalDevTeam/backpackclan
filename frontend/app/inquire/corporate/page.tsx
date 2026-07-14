import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CorporateLeadForm } from "@/components/leads/CorporateLeadForm";

export const metadata: Metadata = {
  title: "Corporate inquiry — Backpackclan",
  description: "Corporate offsites and group expeditions with Backpackclan.",
};

export default function CorporateInquirePage() {
  return (
    <SitePageShell seoPageKey="contact">
      <PageHero
        badge="Corporate"
        title="Team trips that actually inspire"
        subtitle="From weekend offsites to multi-day incentive expeditions."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CorporateLeadForm />
      </section>
    </SitePageShell>
  );
}
