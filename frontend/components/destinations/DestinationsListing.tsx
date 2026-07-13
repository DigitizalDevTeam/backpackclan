import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Destination } from "@/types/destination";

interface DestinationsListingProps {
  destinations: Destination[];
  mediaMap: Record<string, string>;
}

export function DestinationsListing({
  destinations,
  mediaMap,
}: DestinationsListingProps) {
  if (destinations.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        No destinations published yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Explore
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Destinations
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Hand-picked adventure hubs across the Himalayas and beyond.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((dest) => {
          const imageUrl = dest.heroImageId
            ? mediaMap[dest.heroImageId]
            : undefined;
          return (
            <Link
              key={dest.id}
              href={`/destinations/${dest.slug}`}
              className="group overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="h-10 w-10" />
                  </div>
                )}
                {dest.isFeatured ? (
                  <Badge className="absolute left-3 top-3">Featured</Badge>
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <h2 className="text-lg font-semibold group-hover:text-primary">
                  {dest.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {dest.region}, {dest.country}
                </p>
                {dest.tagline ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {dest.tagline}
                  </p>
                ) : null}
                <p className="pt-1 text-sm font-medium text-primary">
                  {dest.tripCount} trip{dest.tripCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
