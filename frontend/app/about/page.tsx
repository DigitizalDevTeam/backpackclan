import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Compass,
  Heart,
  MapPin,
  Mountain,
  Shield,
  Users,
} from "lucide-react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { HomeCertifications } from "@/components/homepage/HomeCertifications";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getHomepageData } from "@/lib/site/public-data";
import { resolveAccreditations } from "@/lib/site/home-categories";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about", {
    title: "About Us — Backpackclan",
    description: "Learn about Backpackclan — Himalayan adventure experts since 2016.",
  });
}

const milestones = [
  { year: "2016", title: "Founded in Dehradun", detail: "First Ladakh bike batch with 12 riders and one support truck." },
  { year: "2018", title: "Expanded to treks", detail: "Kashmir Great Lakes and Spiti circuits joined the calendar." },
  { year: "2020", title: "International departures", detail: "Bhutan and Nepal operations with dedicated ground teams." },
  { year: "2024", title: "18,000+ travellers", detail: "Small-group adventures across 8+ destinations with 4.7★ average rating." },
];

const pillars = [
  {
    icon: Shield,
    title: "Safety-led operations",
    description: "Certified guides, medical kits, oxygen support, and 24/7 ground coordination on every departure.",
  },
  {
    icon: Compass,
    title: "Curated, not catalogued",
    description: "Every route is tested by our team. We sell experiences we would take our families on.",
  },
  {
    icon: Users,
    title: "Small groups, real bonds",
    description: "Intimate batch sizes so you get attention, not crowd management.",
  },
  {
    icon: Heart,
    title: "Local-first impact",
    description: "Homestays, local guides, and fair wages — travel that supports mountain communities.",
  },
];

const team = [
  { name: "Priya Sharma", role: "Founder & Experience Director", region: "Ladakh & Kashmir" },
  { name: "Rahul Mehta", role: "Lead Road Captain", region: "Spiti & Himachal" },
  { name: "Ananya Patel", role: "Trek Operations Head", region: "Uttarakhand & Nepal" },
  { name: "Vikram Singh", role: "International Departures", region: "Bhutan & Nepal" },
];

export default async function AboutPage() {
  const data = await getHomepageData();
  const accreditations = resolveAccreditations(data.sections, data.mediaMap);
  const heroImage = data.mediaMap["2"] ?? data.mediaMap["1"];

  return (
    <SitePageShell seoPageKey="about">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" className="h-full w-full object-cover opacity-40" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FFD200]">
            Since 2016
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            We craft Himalayan journeys that feel personal, safe, and alive
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/75">
            Backpackclan is an adventure travel company built by riders, trekkers, and mountain
            people — not aggregators. We design and lead every trip we sell.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b bg-white py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 lg:grid-cols-4">
          {[
            { value: "18,000+", label: "Happy travellers" },
            { value: "50+", label: "Curated departures" },
            { value: "8+", label: "Destinations" },
            { value: "4.7★", label: "Average rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold text-slate-900">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F58220]">Our story</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              Born on the road, refined in the mountains
            </h2>
            <p className="mt-5 leading-relaxed text-slate-600">
              What started as a Leh Ladakh bike tour for friends became a full-scale adventure
              company serving travellers across India and the Himalayas. We kept the same promise:
              honest itineraries, transparent pricing, and teams who have actually ridden and walked
              every route we sell.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Today we operate guaranteed bike expeditions, backpacking circuits, high-altitude treks,
              and bespoke international departures — always with small groups and hands-on leadership.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200">
            {data.mediaMap["7"] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.mediaMap["7"]}
                alt="Himalayan landscape"
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/3] bg-slate-100" />
            )}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[#FFFBF5] py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-slate-900">What guides us</h2>
            <p className="mt-3 text-slate-600">
              Principles we never compromise on — from route planning to the last kilometre home.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#F58220]">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center font-display text-3xl font-semibold text-slate-900">
          Our journey
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m) => (
            <div
              key={m.year}
              className="relative rounded-2xl border bg-white p-6 shadow-sm before:absolute before:left-6 before:top-0 before:h-1 before:w-12 before:-translate-y-px before:rounded-full before:bg-[#FFD200]"
            >
              <p className="text-sm font-bold text-[#F58220]">{m.year}</p>
              <h3 className="mt-2 font-semibold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="border-t bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-slate-900">Leadership team</h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Operators and captains who live in the mountains — not desk-only planners.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mountain className="h-4 w-4 text-[#F58220]" />
              Based across India &amp; the Himalayas
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="rounded-2xl border bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-lg font-bold text-[#F58220]">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{member.name}</h3>
                <p className="text-sm font-medium text-[#F58220]">{member.role}</p>
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {member.region}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {accreditations ? <HomeCertifications accreditations={accreditations} /> : null}

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F58220]/20 via-transparent to-[#FFD200]/10" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Award className="mx-auto h-10 w-10 text-[#FFD200]" />
          <h2 className="mt-6 font-display text-3xl font-semibold">Ready to travel with us?</h2>
          <p className="mt-4 text-white/70">
            Browse upcoming departures or tell us your dream itinerary — we will design it with the
            same care we put into every batch we lead.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-[#FFD200] px-8 font-bold text-black hover:bg-[#F58220] hover:text-white"
            >
              <Link href="/trips">Explore trips</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/contact">Talk to our team</Link>
            </Button>
          </div>
        </div>
      </section>
    </SitePageShell>
  );
}
