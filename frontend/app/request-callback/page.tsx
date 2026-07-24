import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CallbackLeadForm } from "@/components/leads/CallbackLeadForm";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("request_callback", {
    title: "Request a callback — Backpackclan",
    description: "Request a phone callback from the Backpackclan team.",
  });
}

export default function RequestCallbackPage() {
  return (
    <SitePageShell seoPageKey="request_callback">
      <PageHero
        badge="Callback"
        title="We'll call you back"
        subtitle="Prefer talking it through? Leave your number and a preferred time."
      />
      <section className="site-container py-16">
        <CallbackLeadForm />
      </section>
    </SitePageShell>
  );
}
