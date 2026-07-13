import Link from "next/link";
import { MapPin } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/site/format";
import type { Destination } from "@/types/destination";
import type { PublicTrip } from "@/types/trip";

interface DestinationDetailViewProps {
  destination: Destination;
  trips: PublicTrip[];
  mediaMap: Record<string, string>;
}

export function DestinationDetailView({
  destination,
  trips,
  mediaMap,
}: DestinationDetailViewProps) {
  const heroUrl = destination.heroImageId
    ? mediaMap[destination.heroImageId]
    : undefined;

  return (
    <>
      <PageHero
        badge={destination.region}
        title={destination.name}
        subtitle={
          destination.tagline || destination.overview?.content?.slice(0, 160)
        }
        imageUrl={heroUrl}
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        {destination.overview?.content ? (
          <div className="mb-12 max-w-3xl">
            <h2 className="font-display text-2xl font-semibold">Overview</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
              {destination.overview.content}
            </p>
            {destination.overview.highlights?.length ? (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {destination.overview.highlights.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {h.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Trips</h2>
            <p className="mt-1 text-muted-foreground">
              Packages starting from this destination
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/trips">View all trips</Link>
          </Button>
        </div>

        {trips.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#ebe4d8] px-6 py-10 text-center text-muted-foreground">
            No published trips linked yet — check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const imageUrl = trip.imageId ? mediaMap[trip.imageId] : undefined;
              return (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.slug}`}
                  className="group overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {trip.destination}
                    </p>
                    <h3 className="font-semibold group-hover:text-primary">
                      {trip.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {trip.duration} · from {formatInr(trip.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
