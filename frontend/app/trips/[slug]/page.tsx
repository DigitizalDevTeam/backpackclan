import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TripDetailView } from "@/components/trips/TripDetailView";
import { SitePageShell } from "@/components/site/SitePageShell";
import { Button } from "@/components/ui/button";
import { getTripDetail } from "@/lib/mock/trip-detail-store";
import { getAllTrips, getTripBySlug } from "@/lib/mock/trip-store";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { formatInr } from "@/lib/site/format";

interface TripDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllTrips().map((trip) => ({ slug: trip.slug }));
}

export async function generateMetadata({ params }: TripDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: "Trip Not Found" };
  return {
    title: `${trip.title} | Backpackclan`,
    description: `${trip.duration} adventure to ${trip.destination}. Starting from ${formatInr(trip.price)}.`,
  };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  const layout = getSiteLayoutData();
  const detail = getTripDetail(trip);
  const similarTrips = getAllTrips()
    .filter((t) => t.slug !== slug && (t.destination === trip.destination || t.category === trip.category))
    .slice(0, 3);

  return (
    <SitePageShell>
      <div className="border-b bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href="/trips">
              <ArrowLeft className="h-4 w-4" />
              Back to all trips
            </Link>
          </Button>
        </div>
      </div>
      <TripDetailView
        trip={trip}
        detail={detail}
        mediaMap={layout.mediaMap}
        similarTrips={similarTrips}
      />
    </SitePageShell>
  );
}
