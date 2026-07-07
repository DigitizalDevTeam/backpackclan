import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getSiteLayoutData } from "@/lib/site/public-data";

const seo = getSeoByPageKey("contact");

export const metadata: Metadata = {
  title: seo?.metaTitle ?? "Contact — Backpackclan",
  description: seo?.metaDescription,
};

export default function ContactPage() {
  const layout = getSiteLayoutData();

  return (
    <SitePageShell>
      <PageHero
        badge="Contact"
        title="Plan your next adventure"
        subtitle="Share your travel dates, group size, and dream destination — we'll craft the perfect itinerary."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <ContactForm settings={layout.settings} />
      </section>
    </SitePageShell>
  );
}
