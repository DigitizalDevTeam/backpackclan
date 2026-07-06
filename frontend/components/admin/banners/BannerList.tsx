"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Pencil,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  BANNER_PLACEMENTS,
  type Banner,
  type BannerPlacement,
} from "@/types/banner";
import { getBannerScheduleStatus } from "@/lib/banner/utils";
import type { UserRole } from "@/types/auth";

const statusVariant: Record<
  ReturnType<typeof getBannerScheduleStatus>,
  "success" | "warning" | "secondary" | "outline"
> = {
  active: "success",
  scheduled: "warning",
  expired: "outline",
  inactive: "secondary",
};

interface BannerListProps {
  userRole: UserRole;
}

export function BannerList({ userRole }: BannerListProps) {
  const readOnly = userRole === "viewer";
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [placementFilter, setPlacementFilter] = useState<BannerPlacement | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/banners");
      const result = await res.json();
      if (result.success) setBanners(result.data);
      else toast.error("Failed to load banners");
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const filtered = useMemo(() => {
    return banners.filter((banner) => {
      const q = search.toLowerCase();
      const matchesSearch =
        banner.title.toLowerCase().includes(q) ||
        banner.headline.toLowerCase().includes(q);
      const matchesPlacement =
        placementFilter === "all" || banner.placement === placementFilter;
      return matchesSearch && matchesPlacement;
    });
  }, [banners, search, placementFilter]);

  async function handleToggle(banner: Banner) {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to update status");
        return;
      }
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? result.data : b))
      );
      toast.success(
        result.data.isActive ? "Banner activated" : "Banner deactivated"
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDuplicate(banner: Banner) {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to duplicate banner");
        return;
      }
      toast.success("Banner duplicated");
      fetchBanners();
    } catch {
      toast.error("Failed to duplicate banner");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to delete banner");
        return;
      }
      toast.success("Banner deleted");
      setDeleteTarget(null);
      fetchBanners();
    } catch {
      toast.error("Failed to delete banner");
    } finally {
      setDeleting(false);
    }
  }

  function formatSchedule(banner: Banner) {
    if (!banner.startsAt && !banner.endsAt) return "Always on";
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    if (banner.startsAt && banner.endsAt)
      return `${fmt(banner.startsAt)} – ${fmt(banner.endsAt)}`;
    if (banner.startsAt) return `From ${fmt(banner.startsAt)}`;
    return `Until ${fmt(banner.endsAt!)}`;
  }

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Banner Manager"
        description="Create and manage hero banners with images, videos, and CTAs."
        action={
          !readOnly ? (
            <Button asChild>
              <Link href="/admin/banners/new">
                <Plus className="h-4 w-4" />
                Add Banner
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search banners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={placementFilter}
          onChange={(e) =>
            setPlacementFilter(e.target.value as BannerPlacement | "all")
          }
          className="w-full sm:w-48"
        >
          <option value="all">All placements</option>
          {Object.entries(BANNER_PLACEMENTS).map(([key, val]) => (
            <option key={key} value={key}>
              {val.label}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No banners found"
          description={
            search || placementFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Create your first banner to promote trips and destinations."
          }
          action={
            !readOnly && !search && placementFilter === "all" ? (
              <Button asChild>
                <Link href="/admin/banners/new">
                  <Plus className="h-4 w-4" />
                  Add Banner
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
                    Banner
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                    Placement
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                    Schedule
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
                {filtered.map((banner) => {
                  const scheduleStatus = getBannerScheduleStatus(banner);
                  return (
                    <tr
                      key={banner.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{banner.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {banner.headline}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant="outline">
                          {BANNER_PLACEMENTS[banner.placement].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {formatSchedule(banner)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[scheduleStatus]} className="capitalize">
                          {scheduleStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {!readOnly && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title={banner.isActive ? "Deactivate" : "Activate"}
                                onClick={() => handleToggle(banner)}
                              >
                                {banner.isActive ? (
                                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Duplicate"
                                onClick={() => handleDuplicate(banner)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/banners/${banner.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!readOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(banner)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete banner"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
