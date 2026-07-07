import type { Metadata } from "next";
import { Suspense } from "react";
import { TripsListing } from "@/components/trips/TripsListing";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";
import { getAllTrips } from "@/lib/mock/trip-store";
import { getSiteLayoutData } from "@/lib/site/public-data";

export const metadata: Metadata = {
  title: "All Trips — Bike Tours, Treks & Group Adventures",
  description:
    "Browse all upcoming Backpackclan trips — Leh Ladakh bike tours, Spiti road trips, Kashmir treks, Bhutan & Nepal adventures. Filter by month, duration, and destination.",
};

export default function TripsPage() {
  const layout = getSiteLayoutData();
  const trips = getAllTrips();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader settings={layout.settings} menu={layout.headerMenu} />
      <main>
        <Suspense fallback={<TripsListingSkeleton />}>
          <TripsListing trips={trips} mediaMap={layout.mediaMap} />
        </Suspense>
      </main>
      <SiteFooter settings={layout.settings} menu={layout.footerMenu} />
      <WhatsAppWidget phone={layout.settings.social.whatsapp} />
      <BackToTop />
    </div>
  );
}

function TripsListingSkeleton() {
  return (
    <div className="animate-pulse bg-slate-50">
      <div className="h-48 bg-slate-200" />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
        <div className="h-10 w-64 rounded-xl bg-slate-200" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
