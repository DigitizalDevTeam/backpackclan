import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { PartnerLeadForm } from "@/components/leads/PartnerLeadForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("partners_register", {
    title: "Partner registration — Backpackclan",
    description: "Register as a Backpackclan travel partner.",
  });
}

export default function PartnerRegisterPage() {
  return (
    <SitePageShell seoPageKey="partners_register">
      <PageHero
        badge="Partners"
        title="Grow with Backpackclan"
        subtitle="Resellers, operators, and affiliates — let's collaborate."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <PartnerLeadForm />
      </section>
    </SitePageShell>
  );
}
