"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  Copy,
  ExternalLink,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { PublishStatusBadge } from "@/components/forms/travel/PublishStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import { formatInr, resolvePricing } from "@/lib/pricing/utils";
import type { AdminTrip } from "@/types/admin-trip";
import type { Category } from "@/types/category";
import type { Destination } from "@/types/destination";
import type { PublishStatus } from "@/types/travel";
import type { AuthUser } from "@/types/auth";

function formatPrice(trip: AdminTrip): string {
  const resolved = resolvePricing(trip.pricing);
  if (!resolved.displayPrice) return "—";
  return formatInr(resolved.displayPrice);
}

interface TripListProps {
  user: AuthUser;
}

export function TripList({ user }: TripListProps) {
  const canCreate = hasPermission(user, "trips.create");
  const canUpdate = hasPermission(user, "trips.update");
  const canDelete = hasPermission(user, "trips.delete");

  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminTrip | null>(null);
  const [deleting, setDeleting] = useState(false);

  const destMap = useMemo(
    () => new Map(destinations.map((d) => [d.id, d.name])),
    [destinations]
  );
  const catMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const fetchData = useCallback(async () => {
    try {
      const [tripsRes, destRes, catRes] = await Promise.all([
        fetch("/api/admin/trips"),
        fetch("/api/admin/destinations"),
        fetch("/api/admin/categories"),
      ]);
      const [tripsData, destData, catData] = await Promise.all([
        tripsRes.json(),
        destRes.json(),
        catRes.json(),
      ]);
      if (tripsData.success) setTrips(tripsData.data);
      else toast.error(tripsData.errors?.form ?? "Failed to load trips");
      if (destData.success) setDestinations(destData.data);
      if (catData.success) setCategories(catData.data);
    } catch {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trips.filter((trip) => {
      const destName = destMap.get(trip.destinationId)?.toLowerCase() ?? "";
      const matchesSearch =
        trip.title.toLowerCase().includes(q) ||
        trip.slug.toLowerCase().includes(q) ||
        destName.includes(q);
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      const matchesDest =
        destinationFilter === "all" || trip.destinationId === destinationFilter;
      const matchesCat =
        categoryFilter === "all" || trip.categoryIds.includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesDest && matchesCat;
    });
  }, [trips, search, statusFilter, destinationFilter, categoryFilter, destMap]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  }

  async function patchAction(trip: AdminTrip, action: string) {
    try {
      const res = await fetch(`/api/admin/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Action failed");
        return;
      }
      if (action === "duplicate") {
        toast.success("Trip duplicated");
        fetchData();
      } else {
        setTrips((prev) =>
          prev.map((t) => (t.id === trip.id ? result.data : t))
        );
        toast.success("Trip updated");
      }
    } catch {
      toast.error("Action failed");
    }
  }

  async function bulkAction(action: "bulk_publish" | "bulk_archive") {
    if (selected.size === 0) return;
    try {
      const res = await fetch("/api/admin/trips/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selected) }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Bulk action failed");
        return;
      }
      toast.success(action === "bulk_publish" ? "Trips published" : "Trips archived");
      setSelected(new Set());
      fetchData();
    } catch {
      toast.error("Bulk action failed");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/trips/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to delete trip");
        return;
      }
      toast.success("Trip deleted");
      setDeleteTarget(null);
      fetchData();
    } catch {
      toast.error("Failed to delete trip");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trips"
        description="Build and manage travel products with itineraries, pricing, and content."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/trips/new">
                <Plus className="h-4 w-4" />
                Add Trip
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 xl:flex-row">
        <div className="relative flex-1">
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
          className="w-full xl:w-36"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          value={destinationFilter}
          onChange={(e) => setDestinationFilter(e.target.value)}
          className="w-full xl:w-40"
        >
          <option value="all">All destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full xl:w-40"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {canUpdate && selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkAction("bulk_publish")}>
            Publish
          </Button>
          <Button size="sm" variant="outline" onClick={() => bulkAction("bulk_archive")}>
            Archive
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No trips found"
          description="Create your first travel product or adjust filters."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/trips/new">
                  <Plus className="h-4 w-4" />
                  Add Trip
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {canUpdate && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-input"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Trip
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">
                    Departures
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((trip) => (
                  <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                    {canUpdate && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(trip.id)}
                          onChange={() => toggleSelect(trip.id)}
                          className="rounded border-input"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{trip.title}</p>
                        {trip.isFeatured && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {trip.categoryIds.map((id) => catMap.get(id)).filter(Boolean).join(", ") ||
                          "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {destMap.get(trip.destinationId) ?? "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {trip.durationNights}N/{trip.durationDays}D
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{formatPrice(trip)}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {trip.departuresCount > 0 ? (
                        <Link
                          href={`/admin/trips/${trip.id}/departures`}
                          className="text-primary hover:underline"
                        >
                          {trip.departuresCount}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PublishStatusBadge status={trip.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Preview">
                          <Link href={`/preview/trips/${trip.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canUpdate && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Toggle featured"
                              onClick={() => patchAction(trip, "toggle_featured")}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  trip.isFeatured
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Duplicate"
                              onClick={() => patchAction(trip, "duplicate")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {trip.status !== "archived" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Archive"
                                onClick={() => patchAction(trip, "archive")}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/trips/${trip.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(trip)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete trip"
        description={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
