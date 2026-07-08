import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Heart,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { Button } from "@/components/ui/button";

export const metadata = buildPageMetadata("about", {
  title: "About Us — Backpackclan",
  description: "Learn about Backpackclan and our Himalayan adventure tours.",
});

const stats = [
  { value: "12,000+", label: "Happy travelers" },
  { value: "150+", label: "Trips completed" },
  { value: "8", label: "Destinations" },
  { value: "4.9★", label: "Average rating" },
];

const values = [
  {
    icon: Shield,
    title: "Safety first",
    description: "Certified guides, oxygen support, and 24/7 ground teams on every expedition.",
  },
  {
    icon: Heart,
    title: "Curated experiences",
    description: "Hand-picked routes and stays — no cookie-cutter packages, ever.",
  },
  {
    icon: Users,
    title: "Small groups",
    description: "Intimate group sizes for better bonding and personalized attention.",
  },
  {
    icon: Award,
    title: "Expert leaders",
    description: "Road captains and trek leaders with 5+ years of Himalayan experience.",
  },
];

const team = [
  { name: "Priya Sharma", role: "Founder & Trip Curator", region: "Ladakh & Kashmir" },
  { name: "Rahul Mehta", role: "Lead Road Captain", region: "Spiti & Himachal" },
  { name: "Ananya Patel", role: "Trek Operations", region: "Uttarakhand & Nepal" },
  { name: "Vikram Singh", role: "Bike Expeditions", region: "Ladakh circuits" },
];

export default function AboutPage() {
  const layout = getSiteLayoutData();

  return (
    <SitePageShell seoPageKey="about">
      <PageHero
        badge="Our story"
        title="Adventures crafted in the Himalayas"
        subtitle="Backpackclan was born from a simple belief — the mountains should be accessible, safe, and unforgettable for every traveler."
        imageUrl={layout.mediaMap["2"]}
      />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold">Who we are</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Founded in 2018 by a group of passionate riders and trekkers, Backpackclan started with
              a single Leh Ladakh bike tour and a WhatsApp group of 12 friends. Today we operate
              guaranteed departures across India&apos;s most iconic adventure corridors.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We&apos;re not a travel aggregator — every trip is designed and led by our in-house
              team. From route planning and permit logistics to backup vehicles and medical kits,
              we handle the details so you can focus on the journey.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border bg-slate-50 p-6 text-center">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold">What we stand for</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Every decision we make — from route selection to group size — is guided by these principles.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Meet the team</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          The people who make your Himalayan adventures possible.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <div key={member.name} className="rounded-2xl border p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-primary">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <h3 className="mt-4 font-semibold">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {member.region}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-teal-900 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Ready for your next adventure?</h2>
          <p className="mt-4 text-teal-100">
            Browse our upcoming trips or tell us about your dream itinerary — we&apos;ll make it happen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/trips">Browse trips</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SitePageShell>
  );
}
