"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { PublicTrip, TripRegion } from "@/types/trip";
import type { PaginationMeta } from "@/lib/site/pagination";
import { formatInr } from "@/lib/site/format";
import { PaginationControls } from "@/components/site/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MONTHS = [
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
];

interface TripsListingProps {
  trips: PublicTrip[];
  mediaMap: Record<string, string>;
  meta: PaginationMeta;
  facets: {
    destinations: string[];
    categories: string[];
  };
}

function buildTripsHref(next: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(next).forEach(([key, value]) => {
    if (value && value !== "All" && value !== "all") params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `/trips?${qs}` : "/trips";
}

export function TripsListing({
  trips,
  mediaMap,
  meta,
  facets,
}: TripsListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const destination = searchParams.get("destination") ?? "All";
  const category = searchParams.get("category") ?? "All";
  const region = (searchParams.get("region") as TripRegion | "all") || "all";
  const month = searchParams.get("month");
  const minNights = Number(searchParams.get("min_nights") || 2);
  const maxNights = Number(searchParams.get("max_nights") || 16);
  const searchFromUrl = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(searchFromUrl);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [monthScroll, setMonthScroll] = useState(0);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  const destinationPills = ["All", ...facets.destinations];
  const categoryPills = ["All", ...facets.categories];
  const visibleMonths = MONTHS.slice(monthScroll, monthScroll + 5);

  function updateFilters(patch: Record<string, string | undefined>) {
    const next = {
      destination: destination !== "All" ? destination : undefined,
      category: category !== "All" ? category : undefined,
      region: region !== "all" ? region : undefined,
      month: month ?? undefined,
      min_nights: minNights !== 2 ? String(minNights) : undefined,
      max_nights: maxNights !== 16 ? String(maxNights) : undefined,
      search: searchFromUrl || undefined,
      ...patch,
      page: undefined,
    };
    startTransition(() => {
      router.push(buildTripsHref(next));
    });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters({ search: search.trim() || undefined });
  }

  return (
    <div className={cn("bg-slate-50", isPending && "opacity-80")}>
      <section className="relative h-48 overflow-hidden sm:h-56">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
              Fixed Departures
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Upcoming <span className="text-orange-300">Community</span> Trips
            </h1>
            <p className="mt-2 max-w-lg text-slate-300">
              Curated Himalayan adventures with guaranteed departures and expert guides.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b bg-white py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {destinationPills.map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() =>
                  updateFilters({
                    destination: pill === "All" ? undefined : pill,
                  })
                }
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                  destination === pill
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/50"
                )}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={submitSearch} className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trips, destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </form>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          <aside
            className={cn(
              "w-72 shrink-0",
              mobileFiltersOpen
                ? "fixed inset-0 z-50 flex flex-col bg-white p-6 lg:static lg:block"
                : "hidden lg:block"
            )}
          >
            {mobileFiltersOpen ? (
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <h2 className="text-lg font-bold">Filters</h2>
                <button type="button" onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : null}

            <div className="space-y-6 rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="hidden font-bold lg:block">Filters</h2>

              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Trip Type</p>
                <div className="space-y-2">
                  {categoryPills.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          category: pill === "All" ? undefined : pill,
                        })
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                        category === pill
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {pill}
                      {category === pill ? <ChevronRight className="h-4 w-4" /> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-foreground">Region</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "domestic", label: "India" },
                      { key: "international", label: "International" },
                    ] as const
                  ).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          region: key === "all" ? undefined : key,
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        region === key
                          ? "border-primary bg-primary text-white"
                          : "border-slate-200 text-slate-600"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Duration (nights)</p>
                  <span className="text-xs text-muted-foreground">
                    {minNights}N – {maxNights}N
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={16}
                  value={maxNights}
                  onChange={(e) =>
                    updateFilters({
                      max_nights: e.target.value === "16" ? undefined : e.target.value,
                      min_nights: minNights !== 2 ? String(minNights) : undefined,
                    })
                  }
                  className="w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>2N</span>
                  <span>16N</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => startTransition(() => router.push("/trips"))}
              >
                Clear all filters
              </Button>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0 rounded-full"
                disabled={monthScroll === 0}
                onClick={() => setMonthScroll((s) => Math.max(0, s - 1))}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-1 gap-2 overflow-hidden">
                {visibleMonths.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() =>
                      updateFilters({
                        month: month === m.key ? undefined : m.key,
                      })
                    }
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-center text-sm font-medium transition-all",
                      month === m.key
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/50"
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-9 w-9 shrink-0 rounded-full"
                disabled={monthScroll >= MONTHS.length - 5}
                onClick={() => setMonthScroll((s) => Math.min(MONTHS.length - 5, s + 1))}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                All Upcoming Trips
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({meta.total})
                </span>
              </h2>
            </div>

            {trips.length === 0 ? (
              <div className="rounded-2xl border bg-white py-16 text-center">
                <p className="text-lg font-medium text-foreground">No trips match your filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting filters or search for a different destination.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <TripListCard
                      key={trip.id}
                      trip={trip}
                      imageUrl={mediaMap[trip.imageId] ?? null}
                    />
                  ))}
                </div>
                <PaginationControls
                  meta={meta}
                  pathname="/trips"
                  searchParams={{
                    destination: destination !== "All" ? destination : undefined,
                    category: category !== "All" ? category : undefined,
                    region: region !== "all" ? region : undefined,
                    month: month ?? undefined,
                    min_nights: minNights !== 2 ? String(minNights) : undefined,
                    max_nights: maxNights !== 16 ? String(maxNights) : undefined,
                    search: searchFromUrl || undefined,
                  }}
                />
                {meta.total > 0 ? (
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Showing {meta.from}–{meta.to} of {meta.total} trips
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TripListCard({ trip, imageUrl }: { trip: PublicTrip; imageUrl: string | null }) {
  const discount =
    trip.originalPrice && trip.originalPrice > trip.price
      ? trip.originalPrice - trip.price
      : null;

  const datesLabel = [
    trip.departureDates.join(", "),
    trip.extraBatches ? `+${trip.extraBatches} batches` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-lg sm:flex-row"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-[4/3] sm:w-56 md:w-64 lg:w-72">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        {trip.badge ? (
          <Badge className="absolute left-3 top-3 border-0 bg-orange-500 text-white">
            {trip.badge}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              {trip.duration}
              <span className="text-slate-300">·</span>
              <span className="text-muted-foreground">{trip.category}</span>
            </div>
            <h3 className="text-lg font-bold leading-snug text-foreground group-hover:text-primary">
              {trip.title}
            </h3>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-transform group-hover:scale-110">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="line-clamp-1">{trip.route}</span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <span>{datesLabel}</span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <div>
            {trip.originalPrice ? (
              <p className="text-sm text-red-500 line-through">{formatInr(trip.originalPrice)}</p>
            ) : null}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{formatInr(trip.price)}</span>
              <span className="text-sm text-muted-foreground">Onwards</span>
            </div>
            {discount ? (
              <p className="mt-0.5 text-xs font-semibold text-red-500">
                {formatInr(discount)} Off
              </p>
            ) : null}
          </div>
          <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/90">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
