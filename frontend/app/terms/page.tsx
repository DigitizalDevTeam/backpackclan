import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = {
  title: "Terms & Conditions — Backpackclan",
  description: "Terms and conditions for booking trips and using Backpackclan services.",
};

const sections = [
  {
    title: "Booking & payment",
    body: "A booking is confirmed upon receipt of the advance payment as specified on the trip page. Full payment is due before the departure date unless otherwise agreed. Prices are in INR and include applicable taxes unless stated otherwise.",
  },
  {
    title: "Cancellation policy",
    body: "Cancellations made 30+ days before departure receive a full refund minus processing fees. 15–29 days: 50% refund. 7–14 days: 25% refund. Less than 7 days: no refund. Force majeure events are handled case by case.",
  },
  {
    title: "Trip modifications",
    body: "Backpackclan reserves the right to modify itineraries due to weather, road conditions, government restrictions, or safety concerns. We will provide equivalent alternatives where possible. No compensation for minor changes that do not materially affect the trip experience.",
  },
  {
    title: "Traveler responsibilities",
    body: "Travelers must carry valid government ID, required permits, and adequate travel insurance. You are responsible for meeting health and fitness requirements stated for each trip. Intoxication, reckless behavior, or disrespect toward guides and fellow travelers may result in removal from the trip without refund.",
  },
  {
    title: "Liability",
    body: "Adventure travel involves inherent risks. Backpackclan and its partners are not liable for injury, loss, or damage arising from circumstances beyond our reasonable control, including altitude sickness, weather, or road accidents. We strongly recommend comprehensive travel insurance.",
  },
  {
    title: "Governing law",
    body: "These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.",
  },
];

export default function TermsPage() {
  return (
    <SitePageShell>
      <PageHero
        badge="Legal"
        title="Terms & Conditions"
        subtitle="Last updated: January 2026"
      />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="mb-10 text-muted-foreground">
          By booking a trip or using the Backpackclan website, you agree to these terms. Please read
          them carefully before confirming your booking.
        </p>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold">
                {i + 1}. {section.title}
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </SitePageShell>
  );
}
