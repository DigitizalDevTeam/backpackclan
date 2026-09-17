"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TripCard } from "@/components/homepage/homepage-parts";
import type { ResolvedPopularTrips } from "@/lib/site/home-categories";
import { Button } from "@/components/ui/button";

export function HomePopularTripsSection({
  section,
  mediaMap,
}: {
  section: ResolvedPopularTrips;
  mediaMap: Record<string, string>;
}) {
  if (!section.trips.length) return null;

  const trips = section.trips.slice(0, 8);

  return (
    <section className="site-section bg-slate-50">
      <div className="site-container">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Featured trips
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {section.title}
            </h2>
          </div>
          <Link
            href="/trips"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FFD200] px-5 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[#F58220] hover:text-white"
          >
            View all trips
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {section.layout === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                imageUrl={mediaMap[trip.imageId] ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="scrollbar-hide -mx-3 flex gap-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {trips.map((trip) => (
              <div key={trip.id} className="w-[78vw] shrink-0 sm:w-full sm:shrink">
                <TripCard trip={trip} imageUrl={mediaMap[trip.imageId] ?? null} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Button asChild className="rounded-xl bg-[#F58220] hover:bg-[#e07418]">
            <Link href="/trips">View all trips</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
