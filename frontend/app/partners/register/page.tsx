import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { PartnerLeadForm } from "@/components/leads/PartnerLeadForm";

export const metadata: Metadata = {
  title: "Partner registration — Backpackclan",
  description: "Register as a Backpackclan travel partner.",
};

export default function PartnerRegisterPage() {
  return (
    <SitePageShell seoPageKey="contact">
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
