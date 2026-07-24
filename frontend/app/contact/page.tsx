import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getSiteLayoutData } from "@/lib/site/public-data";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact", {
    title: "Contact — Backpackclan",
    description: "Get in touch with Backpackclan to plan your next adventure.",
  });
}

export default async function ContactPage() {
  const layout = await getSiteLayoutData();

  return (
    <SitePageShell seoPageKey="contact">
      <PageHero
        badge="Contact"
        title="Plan your next adventure"
        subtitle="Share your travel dates, group size, and dream destination — we'll craft the perfect itinerary."
      />
      <section className="site-container py-16">
        <ContactForm settings={layout.settings} />
      </section>
    </SitePageShell>
  );
}
