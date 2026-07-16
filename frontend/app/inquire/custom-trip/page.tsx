import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CustomTripLeadForm } from "@/components/leads/CustomTripLeadForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("inquire_custom_trip", {
    title: "Custom trip inquiry — Backpackclan",
    description: "Plan a private custom trip with Backpackclan.",
  });
}

export default function CustomTripInquirePage() {
  return (
    <SitePageShell seoPageKey="inquire_custom_trip">
      <PageHero
        badge="Custom trips"
        title="Design your own adventure"
        subtitle="Private groups, flexible dates, and tailor-made routes."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CustomTripLeadForm />
      </section>
    </SitePageShell>
  );
}
