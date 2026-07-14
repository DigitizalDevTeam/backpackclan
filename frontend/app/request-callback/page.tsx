import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { CallbackLeadForm } from "@/components/leads/CallbackLeadForm";

export const metadata: Metadata = {
  title: "Request a callback — Backpackclan",
  description: "Request a phone callback from the Backpackclan team.",
};

export default function RequestCallbackPage() {
  return (
    <SitePageShell seoPageKey="contact">
      <PageHero
        badge="Callback"
        title="We'll call you back"
        subtitle="Prefer talking it through? Leave your number and a preferred time."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <CallbackLeadForm />
      </section>
    </SitePageShell>
  );
}
