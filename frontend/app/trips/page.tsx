import type { Metadata } from "next";
import { Suspense } from "react";
import { TripsListing } from "@/components/trips/TripsListing";
import { SitePageShell } from "@/components/site/SitePageShell";
import { getAllTrips } from "@/lib/mock/trip-store";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export const metadata: Metadata = buildPageMetadata("trips", {
  title: "All Trips — Bike Tours, Treks & Group Adventures",
  description:
    "Browse all upcoming Backpackclan trips — Leh Ladakh bike tours, Spiti road trips, Kashmir treks, Bhutan & Nepal adventures.",
});

export default function TripsPage() {
  const trips = getAllTrips();
  const { mediaMap } = getSiteLayoutData();

  return (
    <SitePageShell seoPageKey="trips">
      <Suspense fallback={<TripsListingSkeleton />}>
        <TripsListing trips={trips} mediaMap={mediaMap} />
      </Suspense>
    </SitePageShell>
  );
}

function TripsListingSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6 px-4 py-12">
      <div className="h-10 w-64 rounded bg-slate-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-2xl bg-slate-200" />
        ))}
      </div>
    </div>
  );
}
