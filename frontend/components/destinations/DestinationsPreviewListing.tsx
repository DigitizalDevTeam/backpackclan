"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Destination } from "@/types/destination";

export function DestinationsPreviewListing() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [destRes, mediaRes] = await Promise.all([
          fetch("/api/preview/destinations"),
          fetch("/api/admin/media"),
        ]);
        const destData = await destRes.json();
        const mediaData = await mediaRes.json();
        if (destData.success) setDestinations(destData.data);
        if (mediaData.success) {
          const map: Record<string, string> = {};
          mediaData.data.forEach((m: { id: string; url: string }) => {
            map[m.id] = m.url;
          });
          setMediaMap(map);
        }
      } catch {
        toast.error("Failed to load destinations");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q)
    );
  }, [destinations, search]);

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Preview
          </p>
          <h1 className="mt-1 text-3xl font-bold">Destinations</h1>
          <p className="mt-2 text-muted-foreground">
            Published destination hubs as travellers will see them.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/destinations">Manage in Admin</Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search destinations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No published destinations"
          description="Publish a destination from the admin to see it here."
          action={
            <Button asChild>
              <Link href="/admin/destinations">Go to Destinations</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dest) => {
            const imageUrl = dest.heroImageId
              ? mediaMap[dest.heroImageId]
              : undefined;
            return (
              <Link
                key={dest.id}
                href={`/preview/destinations/${dest.slug}`}
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
                        <MapPin className="h-10 w-10" />
                      </div>
                    )}
                    {dest.isFeatured && (
                      <Badge className="absolute left-3 top-3">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h2 className="font-semibold text-lg group-hover:text-primary">
                      {dest.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {dest.region}, {dest.country}
                    </p>
                    {dest.tagline && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dest.tagline}
                      </p>
                    )}
                    <p className="text-sm font-medium text-primary pt-1">
                      {dest.tripCount} trip{dest.tripCount === 1 ? "" : "s"}
                    </p>
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
