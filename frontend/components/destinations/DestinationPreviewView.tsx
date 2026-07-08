"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MONTH_NAMES } from "@/types/travel";
import type { Destination } from "@/types/destination";
import type { PublicTrip } from "@/types/trip";

interface DestinationPreviewViewProps {
  slug: string;
  mediaMap?: Record<string, string>;
}

export function DestinationPreviewShell({
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
            <Link href="/preview/destinations" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-white" />
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
                <Link href={editHref}>Edit Destination</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function DestinationPreviewView({ slug, mediaMap: initialMediaMap }: DestinationPreviewViewProps) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [pageBanner, setPageBanner] = useState<import("@/types/banner").Banner | null>(null);
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>(initialMediaMap ?? {});
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [destRes, tripsRes, mediaRes] = await Promise.all([
          fetch(`/api/preview/destinations/${slug}`),
          fetch("/api/public/trips"),
          initialMediaMap ? Promise.resolve(null) : fetch("/api/admin/media"),
        ]);

        const destData = await destRes.json();
        if (destData.success) {
          setDestination(destData.data);
          if (destData.pageBanner) setPageBanner(destData.pageBanner);
        }

        const tripsData = await tripsRes.json();
        if (tripsData.success) setTrips(tripsData.data);

        if (mediaRes) {
          const mediaData = await mediaRes.json();
          if (mediaData.success) {
            const map: Record<string, string> = {};
            mediaData.data.forEach((m: { id: string; url: string }) => {
              map[m.id] = m.url;
            });
            setMediaMap(map);
          }
        }
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, initialMediaMap]);

  if (loading) return <LoadingSkeleton variant="cards" />;

  if (!destination) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Destination not found</h1>
        <p className="mt-2 text-muted-foreground">No destination matches &quot;{slug}&quot;.</p>
      </div>
    );
  }

  const heroUrl = destination.heroImageId
    ? mediaMap[destination.heroImageId]
    : undefined;
  // Prefer linkedTripIds; fall back to trips matching destination name
  const linkedTrips =
    destination.linkedTripIds.length > 0
      ? trips.filter((t) => destination.linkedTripIds.includes(t.id))
      : trips.filter((t) => t.destination === destination.name).slice(0, 6);

  return (
    <div>
      <PageHero
        title={destination.name}
        subtitle={destination.tagline}
        badge={`${destination.region}, ${destination.country}`}
        imageUrl={heroUrl}
      />

      {pageBanner && (
        <section className="border-b bg-slate-900 py-10 text-white">
          <div className="mx-auto max-w-7xl px-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{pageBanner.headline}</h2>
              {pageBanner.subheadline && (
                <p className="mt-2 text-slate-300">{pageBanner.subheadline}</p>
              )}
            </div>
            {pageBanner.ctaButtons[0] && (
              <Button asChild className="shrink-0">
                <Link href={pageBanner.ctaButtons[0].url}>{pageBanner.ctaButtons[0].label}</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      {destination.banner.headline && !pageBanner && (
        <section className="border-b bg-orange-50 py-8">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-2xl font-bold">{destination.banner.headline}</h2>
            {destination.banner.subheadline && (
              <p className="mt-2 text-muted-foreground">{destination.banner.subheadline}</p>
            )}
            {destination.banner.ctaLabel && destination.banner.ctaUrl && (
              <Button className="mt-4" asChild>
                <Link href={destination.banner.ctaUrl}>{destination.banner.ctaLabel}</Link>
              </Button>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {destination.overview.content && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Overview</h2>
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: destination.overview.content }}
            />
            {destination.overview.highlights.length > 0 && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {destination.overview.highlights.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-2 rounded-lg border p-4"
                  >
                    {h.icon && <span className="text-xl">{h.icon}</span>}
                    <p className="text-sm">{h.text}</p>
                  </div>
                ))}
              </div>
            )}
            {destination.overview.gallery.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
                {destination.overview.gallery.map((id) =>
                  mediaMap[id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={id}
                      src={mediaMap[id]}
                      alt=""
                      className="aspect-video rounded-lg object-cover"
                    />
                  ) : null
                )}
              </div>
            )}
          </section>
        )}

        {linkedTrips.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Packages</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {linkedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/preview/trips/${trip.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      {mediaMap[trip.imageId] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaMap[trip.imageId]}
                          alt=""
                          className="mb-3 aspect-video w-full rounded-lg object-cover"
                        />
                      )}
                      <h3 className="font-semibold group-hover:text-primary">
                        {trip.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {trip.duration}
                      </p>
                      <p className="mt-2 font-bold text-primary">
                        ₹{trip.price.toLocaleString("en-IN")}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {(destination.bestTime.content || destination.bestTime.recommendedMonths.length > 0) && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Best Time to Visit</h2>
            {destination.bestTime.content && (
              <div
                className="prose prose-sm max-w-none text-muted-foreground mb-4"
                dangerouslySetInnerHTML={{ __html: destination.bestTime.content }}
              />
            )}
            {destination.bestTime.recommendedMonths.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {destination.bestTime.recommendedMonths.map((m) => (
                  <Badge key={m} variant="secondary">
                    {MONTH_NAMES[m - 1]}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        )}

        {destination.weather.some((w) => w.conditions || w.avgHigh != null) && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Weather</h2>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-2 text-left">Month</th>
                    <th className="px-4 py-2 text-left">High</th>
                    <th className="px-4 py-2 text-left">Low</th>
                    <th className="px-4 py-2 text-left">Conditions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {destination.weather
                    .filter((w) => w.conditions || w.avgHigh != null || w.avgLow != null)
                    .map((w) => (
                      <tr key={w.month}>
                        <td className="px-4 py-2 font-medium">{MONTH_NAMES[w.month - 1]}</td>
                        <td className="px-4 py-2">{w.avgHigh != null ? `${w.avgHigh}°C` : "—"}</td>
                        <td className="px-4 py-2">{w.avgLow != null ? `${w.avgLow}°C` : "—"}</td>
                        <td className="px-4 py-2 text-muted-foreground">{w.conditions || "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {destination.faqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">FAQs</h2>
            <div className="space-y-2">
              {destination.faqs.map((faq) => (
                <div key={faq.id} className="rounded-lg border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    {faq.question}
                    <Star className="h-4 w-4 shrink-0 text-muted-foreground" />
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

        {destination.map.embedUrl && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Map</h2>
            <div className="overflow-hidden rounded-lg border">
              <iframe
                src={
                  destination.map.embedUrl.includes("iframe")
                    ? destination.map.embedUrl.match(/src=["']([^"']+)["']/i)?.[1] ??
                      destination.map.embedUrl
                    : destination.map.embedUrl
                }
                title="Destination map"
                className="h-96 w-full"
                loading="lazy"
              />
            </div>
          </section>
        )}

        <section className="rounded-xl bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold">Ready to explore {destination.name}?</h2>
          <p className="mt-2 text-muted-foreground">
            Enquire now — booking opens in Milestone 3.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/contact">Enquire</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
