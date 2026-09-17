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
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/auth/permissions";
import type { Destination } from "@/types/destination";
import type { PublishStatus } from "@/types/travel";
import type { AuthUser } from "@/types/auth";

interface DestinationListProps {
  user: AuthUser;
}

export function DestinationList({ user }: DestinationListProps) {
  const canCreate = hasPermission(user, "destinations.create");
  const canUpdate = hasPermission(user, "destinations.update");
  const canDelete = hasPermission(user, "destinations.delete");

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PublishStatus | "all">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "yes" | "no">("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/destinations");
      const result = await res.json();
      if (result.success) setDestinations(result.data);
      else toast.error("Failed to load destinations");
    } catch {
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const countries = useMemo(
    () => [...new Set(destinations.map((d) => d.country))].sort(),
    [destinations]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return destinations.filter((dest) => {
      const matchesSearch =
        dest.name.toLowerCase().includes(q) ||
        dest.slug.toLowerCase().includes(q) ||
        dest.region.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || dest.status === statusFilter;
      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "yes" ? dest.isFeatured : !dest.isFeatured);
      const matchesCountry =
        countryFilter === "all" || dest.country === countryFilter;
      return matchesSearch && matchesStatus && matchesFeatured && matchesCountry;
    });
  }, [destinations, search, statusFilter, featuredFilter, countryFilter]);

  async function patchAction(destination: Destination, action: string) {
    try {
      const res = await fetch(`/api/admin/destinations/${destination.id}`, {
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
        toast.success("Destination duplicated");
        fetchDestinations();
      } else {
        setDestinations((prev) =>
          prev.map((d) => (d.id === destination.id ? result.data : d))
        );
        toast.success(
          action === "archive"
            ? "Destination archived"
            : action === "toggle_featured"
              ? result.data.isFeatured
                ? "Marked as featured"
                : "Removed from featured"
              : "Updated"
        );
      }
    } catch {
      toast.error("Action failed");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/destinations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to delete destination");
        return;
      }
      toast.success("Destination deleted");
      setDeleteTarget(null);
      fetchDestinations();
    } catch {
      toast.error("Failed to delete destination");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Destinations"
        description="Manage destination hub pages with overview, FAQs, and linked trips."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/destinations/new">
                <Plus className="h-4 w-4" />
                Add Destination
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PublishStatus | "all")}
          className="w-full lg:w-40"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value as "all" | "yes" | "no")}
          className="w-full lg:w-36"
        >
          <option value="all">All featured</option>
          <option value="yes">Featured</option>
          <option value="no">Not featured</option>
        </Select>
        <Select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="w-full lg:w-40"
        >
          <option value="all">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No destinations found"
          description={
            search || statusFilter !== "all" || featuredFilter !== "all" || countryFilter !== "all"
              ? "Try adjusting your filters."
              : "Create your first destination hub page."
          }
          action={
            canCreate && !search ? (
              <Button asChild>
                <Link href="/admin/destinations/new">
                  <Plus className="h-4 w-4" />
                  Add Destination
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Country / Region
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Trips
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
                {filtered.map((dest) => (
                  <tr key={dest.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{dest.name}</p>
                        {dest.isFeatured && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">/{dest.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {dest.country}
                      {dest.region ? ` · ${dest.region}` : ""}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">{dest.tripCount}</td>
                    <td className="px-4 py-3">
                      <PublishStatusBadge status={dest.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="Preview">
                          <Link href={`/preview/destinations/${dest.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canUpdate && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={dest.isFeatured ? "Unfeature" : "Feature"}
                              onClick={() => patchAction(dest, "toggle_featured")}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  dest.isFeatured
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Duplicate"
                              onClick={() => patchAction(dest, "duplicate")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {dest.status !== "archived" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Archive"
                                onClick={() => patchAction(dest, "archive")}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/destinations/${dest.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(dest)}
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
        title="Delete destination"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
