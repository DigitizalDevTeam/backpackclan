"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { IndianRupee, Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { PublishStatusBadge } from "@/components/forms/travel/PublishStatusBadge";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import { PRICE_PER_LABELS } from "@/lib/pricing/utils";
import type {
  DeparturePricingSummary,
  TripPricingSummary,
} from "@/types/pricing";
import type { PublishStatus } from "@/types/travel";
import type { AuthUser } from "@/types/auth";

interface PricingOverview {
  trips: TripPricingSummary[];
  departureOverrides: DeparturePricingSummary[];
}

interface PricingListProps {
  user: AuthUser;
}

function formatDate(date: string): string {
  try {
    return format(parseISO(date.slice(0, 10)), "dd MMM yyyy");
  } catch {
    return date;
  }
}

export function PricingList({ user }: PricingListProps) {
  const canUpdate = hasPermission(user, "pricing.update");
  const [data, setData] = useState<PricingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      const result = await res.json();
      if (result.success) setData(result.data);
      else toast.error("Failed to load pricing");
    } catch {
      toast.error("Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTrips = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.trips.filter((trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(q) || trip.slug.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pricing Rules"
        description="Manage trip base prices, sale offers, and departure-specific overrides."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/trips">
              <IndianRupee className="h-4 w-4" />
              All Trips
            </Link>
          </Button>
        }
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Trip pricing</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search trips..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PublishStatus | "all")}
            className="w-full sm:w-40"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        </div>

        {filteredTrips.length === 0 ? (
          <EmptyState
            title="No trips found"
            description="Adjust filters or create a trip first."
          />
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Trip</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Price display</th>
                  <th className="px-4 py-3 text-left font-medium">Per</th>
                  <th className="px-4 py-3 text-right font-medium">Overrides</th>
                  {canUpdate && (
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trips/${trip.id}`}
                        className="font-medium hover:underline"
                      >
                        {trip.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PublishStatusBadge status={trip.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriceDisplay pricing={trip.pricing} resolved={trip.resolved} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {PRICE_PER_LABELS[trip.pricing.pricePer]}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {trip.departuresWithOverride > 0 ? (
                        <Link
                          href={`/admin/trips/${trip.id}/departures`}
                          className="text-primary hover:underline"
                        >
                          {trip.departuresWithOverride}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    {canUpdate && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/pricing/${trip.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data && data.departureOverrides.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Departure price overrides</h2>
          <p className="text-sm text-muted-foreground">
            These departures use custom pricing instead of the trip default.
          </p>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Trip</th>
                  <th className="px-4 py-3 text-left font-medium">Departure</th>
                  <th className="px-4 py-3 text-left font-medium">Trip default</th>
                  <th className="px-4 py-3 text-left font-medium">Override price</th>
                  {canUpdate && (
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.departureOverrides.map((dep) => (
                  <tr key={dep.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">{dep.tripTitle}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDate(dep.startDate)} – {formatDate(dep.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <PriceDisplay pricing={dep.tripPricing} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <PriceDisplay
                        pricing={dep.tripPricing}
                        override={dep.pricingOverride}
                        resolved={dep.resolved}
                        size="sm"
                      />
                    </td>
                    {canUpdate && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/departures/${dep.id}`}>Edit</Link>
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
