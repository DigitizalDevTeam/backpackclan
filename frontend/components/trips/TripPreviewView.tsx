"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Luggage, Star } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import { SeatStatusBadge } from "@/components/forms/travel/SeatStatusBadge";
import { resolvePricing } from "@/lib/pricing/utils";
import {
  TRIP_DIFFICULTY_LABELS,
  TRIP_TYPE_LABELS,
  type AdminTrip,
} from "@/types/admin-trip";
import type { DepartureListItem } from "@/types/departure";
import type { Destination } from "@/types/destination";
import type { PublicTrip } from "@/types/trip";
import { formatInr } from "@/lib/pricing/utils";

export function TripPreviewShell({
  children,
  editHref,
}: {
  children: React.ReactNode;
  editHref?: string;
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/preview/trips" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Luggage className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Backpackclan</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/preview/trips" className="hover:text-foreground">
                Trips
              </Link>
              <Link href="/preview/destinations" className="hover:text-foreground">
                Destinations
              </Link>
              <Link href="/preview/homepage" className="hover:text-foreground">
                Homepage
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Preview
            </span>
            {editHref && (
              <Button size="sm" variant="outline" asChild>
                <Link href={editHref}>Edit Trip</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function formatDate(date: string): string {
  try {
    return format(parseISO(date.slice(0, 10)), "dd MMM yyyy");
  } catch {
    return date;
  }
}

export function TripPreviewView({ slug }: { slug: string }) {
  const [trip, setTrip] = useState<AdminTrip | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [departures, setDepartures] = useState<DepartureListItem[]>([]);
  const [relatedTrips, setRelatedTrips] = useState<PublicTrip[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [openDay, setOpenDay] = useState<number | null>(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/preview/trips/${slug}`);
        const data = await res.json();
        if (!data.success) return;

        setTrip(data.data);

        const [destRes, mediaRes, depRes, publicTripsRes] = await Promise.all([
          fetch(`/api/admin/destinations/${data.data.destinationId}`),
          fetch("/api/admin/media"),
          fetch(`/api/admin/departures?trip=${data.data.id}`),
          fetch("/api/public/trips"),
        ]);
        const destData = await destRes.json();
        const mediaData = await mediaRes.json();
        const depData = await depRes.json();
        const publicData = await publicTripsRes.json();

        if (destData.success) setDestination(destData.data);
        if (mediaData.success) {
          const map: Record<string, string> = {};
          mediaData.data.forEach((m: { id: string; url: string }) => {
            map[m.id] = m.url;
          });
          setMediaMap(map);
        }
        if (depData.success) {
          const today = new Date().toISOString().slice(0, 10);
          const upcoming = (depData.data as DepartureListItem[])
            .filter((d) => !d.isCancelled && d.startDate >= today)
            .slice(0, 6);
          setDepartures(upcoming);
        }
        if (publicData.success) {
          const related = (publicData.data as PublicTrip[])
            .filter(
              (t) =>
                t.id !== data.data.id &&
                (t.destination === destData.data?.name ||
                  t.category ===
                    (publicData.data as PublicTrip[]).find(
                      (x) => x.id === data.data.id
                    )?.category)
            )
            .slice(0, 3);
          setRelatedTrips(
            related.length > 0
              ? related
              : (publicData.data as PublicTrip[])
                  .filter((t) => t.id !== data.data.id)
                  .slice(0, 3)
          );
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) return <LoadingSkeleton variant="cards" />;
  if (!trip) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Trip not found</h1>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/preview/trips">Back to trips</Link>
        </Button>
      </div>
    );
  }

  const heroUrl = trip.coverImageId ? mediaMap[trip.coverImageId] : undefined;

  return (
    <div>
      <PageHero
        title={trip.title}
        subtitle={trip.summary}
        badge={destination?.name}
        imageUrl={heroUrl}
      />

      <div className="border-b bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{TRIP_TYPE_LABELS[trip.tripType]}</Badge>
            <Badge variant="outline">{TRIP_DIFFICULTY_LABELS[trip.difficulty]}</Badge>
            <Badge variant="outline">
              {trip.durationNights}N / {trip.durationDays}D
            </Badge>
            <Badge variant="outline">Max {trip.maxGroupSize} travellers</Badge>
            {trip.minAge != null && (
              <Badge variant="outline">Min age {trip.minAge}+</Badge>
            )}
          </div>
          <div className="text-right">
            <PriceDisplay pricing={trip.pricing} showPricePer size="md" />
            <Button className="mt-3" asChild>
              <Link href="/contact">Enquire</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {destination && (
          <p className="text-sm text-muted-foreground -mt-8">
            Destination:{" "}
            <Link
              href={`/preview/destinations/${destination.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {destination.name}
            </Link>
          </p>
        )}

        {trip.overview.content && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: trip.overview.content }}
            />
            {trip.overview.highlights.length > 0 && (
              <ul className="mt-4 space-y-2">
                {trip.overview.highlights.map((h) => (
                  <li key={h.id} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {h.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {trip.itinerary.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Itinerary</h2>
            <div className="space-y-2">
              {trip.itinerary.map((day, index) => (
                <div key={day.id} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
                    onClick={() => setOpenDay(openDay === index ? null : index)}
                  >
                    Day {day.dayNumber}: {day.title || "Untitled"}
                  </button>
                  {openDay === index && (
                    <div className="border-t px-4 py-3 space-y-2">
                      <div
                        className="prose prose-sm max-w-none text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: day.description }}
                      />
                      {day.overnight && (
                        <p className="text-sm">
                          <span className="font-medium">Overnight:</span>{" "}
                          {day.overnight}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(trip.inclusions.length > 0 || trip.exclusions.length > 0) && (
          <section className="grid gap-8 md:grid-cols-2">
            {trip.inclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Inclusions</h3>
                <ul className="space-y-2 text-sm">
                  {trip.inclusions.map((i) => (
                    <li key={i.id}>✓ {i.text}</li>
                  ))}
                </ul>
              </div>
            )}
            {trip.exclusions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Exclusions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {trip.exclusions.map((i) => (
                    <li key={i.id}>✗ {i.text}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {departures.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Upcoming departures</h2>
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Dates</th>
                    <th className="px-4 py-3 text-left font-medium">Seats</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.map((dep) => {
                    const resolved = resolvePricing(
                      trip.pricing,
                      dep.pricingOverride
                    );
                    return (
                      <tr key={dep.id} className="border-b last:border-0">
                        <td className="px-4 py-3 whitespace-nowrap">
                          {formatDate(dep.startDate)} – {formatDate(dep.endDate)}
                        </td>
                        <td className="px-4 py-3">
                          {dep.availableSeats} / {dep.totalSeats} available
                        </td>
                        <td className="px-4 py-3">
                          <SeatStatusBadge
                            status={dep.effectiveStatus ?? "available"}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <PriceDisplay
                            pricing={trip.pricing}
                            override={dep.pricingOverride}
                            resolved={resolved}
                            size="sm"
                          />
                          {dep.pricingOverride && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              (override)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {trip.faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">FAQs</h2>
            <div className="space-y-2">
              {trip.faqs.map((faq) => (
                <div key={faq.id} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full px-4 py-3 text-left font-medium"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    {faq.question}
                  </button>
                  {openFaq === faq.id && (
                    <div
                      className="border-t px-4 py-3 prose prose-sm max-w-none text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {trip.testimonials.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Testimonials</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {trip.testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      &quot;{t.text}&quot;
                    </p>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tripTaken}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {relatedTrips.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Related trips</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTrips.map((related) => (
                <Link
                  key={related.id}
                  href={`/preview/trips/${related.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
                    {mediaMap[related.imageId] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaMap[related.imageId]}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold group-hover:text-primary">
                        {related.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {related.duration} · {related.destination}
                      </p>
                      <p className="mt-2 font-bold text-primary">
                        {formatInr(related.price)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold">Interested in this trip?</h2>
          <p className="mt-2 text-muted-foreground">
            Enquire now to reserve your seat on an upcoming departure.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/contact">Enquire</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
