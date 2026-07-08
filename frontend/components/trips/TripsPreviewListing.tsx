"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Luggage, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import { PublishStatusBadge } from "@/components/forms/travel/PublishStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  TRIP_DIFFICULTY_LABELS,
  TRIP_TYPE_LABELS,
  type AdminTrip,
} from "@/types/admin-trip";

interface PreviewTripCard extends AdminTrip {
  publicPrice?: number;
  originalPrice?: number;
  destinationName?: string;
  categoryName?: string;
}

export function TripsPreviewListing() {
  const [trips, setTrips] = useState<PreviewTripCard[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [tripsRes, mediaRes] = await Promise.all([
          fetch("/api/preview/trips"),
          fetch("/api/admin/media"),
        ]);
        const tripsData = await tripsRes.json();
        const mediaData = await mediaRes.json();
        if (tripsData.success) setTrips(tripsData.data);
        if (mediaData.success) {
          const map: Record<string, string> = {};
          mediaData.data.forEach((m: { id: string; url: string }) => {
            map[m.id] = m.url;
          });
          setMediaMap(map);
        }
      } catch {
        toast.error("Failed to load trips");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trips.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.destinationName ?? "").toLowerCase().includes(q)
    );
  }, [trips, search]);

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Preview
          </p>
          <h1 className="mt-1 text-3xl font-bold">All Trips</h1>
          <p className="mt-2 text-muted-foreground">
            Published trips as they appear to travellers. Drafts are hidden.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/trips">Manage in Admin</Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search trips..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No published trips"
          description="Publish a trip from the admin to see it here."
          action={
            <Button asChild>
              <Link href="/admin/trips">Go to Trips</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((trip) => {
            const imageUrl = trip.coverImageId
              ? mediaMap[trip.coverImageId]
              : undefined;
            return (
              <Link
                key={trip.id}
                href={`/preview/trips/${trip.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Luggage className="h-10 w-10" />
                      </div>
                    )}
                    {trip.isFeatured && (
                      <Badge className="absolute left-3 top-3">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline">{TRIP_TYPE_LABELS[trip.tripType]}</Badge>
                      <Badge variant="outline">
                        {TRIP_DIFFICULTY_LABELS[trip.difficulty]}
                      </Badge>
                      <PublishStatusBadge status={trip.status} />
                    </div>
                    <div>
                      <h2 className="font-semibold leading-snug group-hover:text-primary">
                        {trip.title}
                      </h2>
                      {trip.destinationName && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {trip.destinationName}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trip.summary}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm text-muted-foreground">
                        {trip.durationNights}N / {trip.durationDays}D
                      </span>
                      <PriceDisplay pricing={trip.pricing} size="sm" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
