"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { SeatStatusBadge } from "@/components/forms/travel/SeatStatusBadge";
import { BulkDepartureModal } from "@/components/admin/departures/BulkDepartureModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import { DEPARTURE_STATUS_OPTIONS } from "@/lib/validations/departure";
import type { DepartureListItem } from "@/types/departure";
import type { AdminTrip } from "@/types/admin-trip";
import type { DepartureStatus } from "@/types/travel";
import type { AuthUser } from "@/types/auth";

interface DepartureListProps {
  user: AuthUser;
  defaultTripFilter?: string;
  tripScoped?: boolean;
  tripTitle?: string;
}

function formatDate(date: string): string {
  try {
    return format(parseISO(date.slice(0, 10)), "dd MMM yyyy");
  } catch {
    return date;
  }
}

export function DepartureList({
  user,
  defaultTripFilter = "",
  tripScoped = false,
  tripTitle,
}: DepartureListProps) {
  const canCreate = hasPermission(user, "departures.create");
  const canUpdate = hasPermission(user, "departures.update");
  const canDelete = hasPermission(user, "departures.delete");

  const [departures, setDepartures] = useState<DepartureListItem[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tripFilter, setTripFilter] = useState(defaultTripFilter || "all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<DepartureStatus | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<DepartureListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const tripQuery =
        tripScoped && defaultTripFilter
          ? `?trip=${defaultTripFilter}`
          : defaultTripFilter
            ? `?trip=${defaultTripFilter}`
            : "";
      const [depRes, tripsRes] = await Promise.all([
        fetch(`/api/admin/departures${tripQuery}`),
        fetch("/api/admin/trips"),
      ]);
      const [depData, tripsData] = await Promise.all([
        depRes.json(),
        tripsRes.json(),
      ]);
      if (depData.success) setDepartures(depData.data);
      if (tripsData.success) setTrips(tripsData.data);
    } catch {
      toast.error("Failed to load departures");
    } finally {
      setLoading(false);
    }
  }, [defaultTripFilter, tripScoped]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (defaultTripFilter) setTripFilter(defaultTripFilter);
  }, [defaultTripFilter]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const dep of departures) {
      months.add(dep.startDate.slice(0, 7));
    }
    return Array.from(months).sort();
  }, [departures]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return departures.filter((dep) => {
      const matchesSearch =
        dep.tripTitle.toLowerCase().includes(q) ||
        dep.startDate.includes(q) ||
        dep.endDate.includes(q);
      const matchesTrip =
        tripScoped || tripFilter === "all" || dep.tripId === tripFilter;
      const matchesMonth =
        monthFilter === "all" || dep.startDate.startsWith(monthFilter);
      const matchesStatus =
        statusFilter === "all" || dep.effectiveStatus === statusFilter;
      return matchesSearch && matchesTrip && matchesMonth && matchesStatus;
    });
  }, [departures, search, tripFilter, monthFilter, statusFilter, tripScoped]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/departures/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to delete departure");
        return;
      }
      toast.success("Departure deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete departure");
    } finally {
      setDeleting(false);
    }
  }

  const resolvedTripTitle =
    tripTitle ?? trips.find((t) => t.id === defaultTripFilter)?.title ?? "";

  if (loading) return <LoadingSkeleton variant="table" />;

  const title = tripScoped && resolvedTripTitle
    ? `${resolvedTripTitle} — Departures`
    : "Departures";
  const description = tripScoped
    ? "Manage scheduled departures and seat inventory for this trip."
    : "Calendar-based departures with seat inventory and status badges.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            {!tripScoped && (
              <Button variant="outline" asChild>
                <Link href="/admin/departures/calendar">
                  <Calendar className="h-4 w-4" />
                  Calendar
                </Link>
              </Button>
            )}
            {canCreate && (
              <>
                <Button variant="outline" onClick={() => setBulkOpen(true)}>
                  Bulk Create
                </Button>
                <Button asChild>
                  <Link
                    href={
                      tripScoped && defaultTripFilter
                        ? `/admin/departures/new?trip=${defaultTripFilter}`
                        : "/admin/departures/new"
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Departure
                  </Link>
                </Button>
              </>
            )}
            {tripScoped && (
              <Button variant="outline" asChild>
                <Link href={`/admin/trips/${defaultTripFilter}`}>Back to Trip</Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by trip or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {!tripScoped && (
          <Select
            value={tripFilter}
            onChange={(e) => setTripFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="all">All trips</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full sm:w-40"
        >
          <option value="all">All months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {format(parseISO(`${m}-01`), "MMM yyyy")}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as DepartureStatus | "all")
          }
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          {DEPARTURE_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No departures found"
          description={
            search || tripFilter !== "all" || monthFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first departure to start managing seat inventory."
          }
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/departures/new">
                  <Plus className="h-4 w-4" />
                  Add Departure
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {!tripScoped && <th className="px-4 py-3 text-left font-medium">Trip</th>}
                <th className="px-4 py-3 text-left font-medium">Start</th>
                <th className="px-4 py-3 text-left font-medium">End</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 text-right font-medium">Booked</th>
                <th className="px-4 py-3 text-right font-medium">Available</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Cancel by</th>
                {(canUpdate || canDelete) && (
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((dep) => (
                <tr key={dep.id} className="border-b last:border-0 hover:bg-muted/30">
                  {!tripScoped && (
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/trips/${dep.tripId}`}
                        className="font-medium hover:underline"
                      >
                        {dep.tripTitle}
                      </Link>
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(dep.startDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(dep.endDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{dep.totalSeats}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{dep.bookedSeats}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{dep.availableSeats}</td>
                  <td className="px-4 py-3">
                    <SeatStatusBadge
                      status={dep.effectiveStatus ?? "available"}
                    />
                    {dep.statusOverride && (
                      <span className="ml-1 text-xs text-muted-foreground">(override)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {dep.cancellationDeadline
                      ? formatDate(dep.cancellationDeadline)
                      : "—"}
                  </td>
                  {(canUpdate || canDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {canUpdate && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/departures/${dep.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(dep)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete departure"
        description={`Remove the departure on ${deleteTarget ? formatDate(deleteTarget.startDate) : ""} for ${deleteTarget?.tripTitle ?? ""}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />

      <BulkDepartureModal
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        trips={trips}
        defaultTripId={tripScoped ? defaultTripFilter : tripFilter !== "all" ? tripFilter : ""}
        onSuccess={fetchData}
      />
    </div>
  );
}
