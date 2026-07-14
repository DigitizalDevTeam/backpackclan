import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BookingCheckoutWizard } from "@/components/booking/BookingCheckoutWizard";
import { SitePageShell } from "@/components/site/SitePageShell";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/session";
import { isCustomerUser } from "@/lib/auth/user-kind";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { getPublicTripDetail } from "@/lib/site/trip-data";

interface BookTripPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    departure?: string;
    adults?: string;
    children?: string;
  }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BookTripPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicTripDetail(slug);
  if (!data) return { title: "Book trip | Backpackclan" };
  return {
    title: `Book ${data.trip.title} | Backpackclan`,
    description: `Complete your booking for ${data.trip.title}.`,
  };
}

export default async function BookTripPage({
  params,
  searchParams,
}: BookTripPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await getSession();

  const qs = new URLSearchParams({
    ...(query.departure ? { departure: query.departure } : {}),
    ...(query.adults ? { adults: query.adults } : {}),
    ...(query.children ? { children: query.children } : {}),
  });
  const bookPath = qs.toString() ? `/book/${slug}?${qs.toString()}` : `/book/${slug}`;

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(bookPath)}`);
  }

  if (!isCustomerUser(session.user)) {
    redirect("/admin/dashboard");
  }

  const [data, layout] = await Promise.all([
    getPublicTripDetail(slug),
    getSiteLayoutData(),
  ]);

  if (!data) notFound();

  const adults = Math.max(1, Number.parseInt(query.adults ?? "1", 10) || 1);
  const children = Math.max(0, Number.parseInt(query.children ?? "0", 10) || 0);
  const departureId =
    query.departure ??
    data.detail.batches.find((b) => b.status !== "sold_out")?.id ??
    "";

  return (
    <SitePageShell>
      <div className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
            <Link href={`/trips/${slug}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to trip
            </Link>
          </Button>
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            Secure booking · {session.user.name}
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <BookingCheckoutWizard
            trip={data.trip}
            detail={data.detail}
            initialDepartureId={departureId}
            initialAdults={adults}
            initialChildren={children}
            user={session.user}
            imageUrl={layout.mediaMap[data.trip.imageId] ?? null}
          />
        </div>
      </div>
    </SitePageShell>
  );
}
