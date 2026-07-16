import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TripDetailView } from "@/components/trips/TripDetailView";
import { SitePageShell } from "@/components/site/SitePageShell";
import { Button } from "@/components/ui/button";
import { getSiteLayoutData } from "@/lib/site/public-data";
import {
  getPublicTripDetail,
} from "@/lib/site/trip-data";
import { formatInr } from "@/lib/site/format";

interface TripDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: TripDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getPublicTripDetail(slug);
  if (!detail) return { title: "Trip Not Found" };
  const { trip } = detail;
  return {
    title: `${trip.title} | Backpackclan`,
    description: `${trip.duration} adventure to ${trip.destination}. Starting from ${formatInr(trip.price)}.`,
  };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { slug } = await params;
  const [data, layout] = await Promise.all([
    getPublicTripDetail(slug),
    getSiteLayoutData(),
  ]);

  if (!data) notFound();

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
        trip={data.trip}
        detail={data.detail}
        mediaMap={layout.mediaMap}
        similarTrips={data.related}
      />
    </SitePageShell>
  );
}
