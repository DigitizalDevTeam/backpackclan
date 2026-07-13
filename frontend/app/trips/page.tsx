import type { Metadata } from "next";
import { Suspense } from "react";
import { TripsListing } from "@/components/trips/TripsListing";
import { SitePageShell } from "@/components/site/SitePageShell";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { getPublicTripsPage } from "@/lib/site/trip-data";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("trips", {
    title: "All Trips — Bike Tours, Treks & Group Adventures",
    description:
      "Browse all upcoming Backpackclan trips — Leh Ladakh bike tours, Spiti road trips, Kashmir treks, Bhutan & Nepal adventures.",
  });
}

interface TripsPageProps {
  searchParams: Promise<{
    page?: string;
    destination?: string;
    category?: string;
    region?: string;
    search?: string;
    month?: string;
    min_nights?: string;
    max_nights?: string;
  }>;
}

export default async function TripsPage({ searchParams }: TripsPageProps) {
  const params = await searchParams;
  const [{ mediaMap }, list] = await Promise.all([
    getSiteLayoutData(),
    getPublicTripsPage({
      page: Math.max(1, Number(params.page) || 1),
      perPage: 12,
      destination: params.destination,
      category: params.category,
      region: params.region,
      search: params.search,
      month: params.month,
      minNights: params.min_nights ? Number(params.min_nights) : undefined,
      maxNights: params.max_nights ? Number(params.max_nights) : undefined,
    }),
  ]);

  return (
    <SitePageShell seoPageKey="trips">
      <Suspense fallback={<TripsListingSkeleton />}>
        <TripsListing
          trips={list.trips}
          mediaMap={mediaMap}
          meta={list.meta}
          facets={list.facets}
        />
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
