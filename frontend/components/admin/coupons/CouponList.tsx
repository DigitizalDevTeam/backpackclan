"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Percent,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDate, formatInr } from "@/lib/site/format";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import type { AdminCoupon } from "@/types/admin-coupon";

interface CouponListProps {
  user: AuthUser;
}

function couponScheduleLabel(coupon: AdminCoupon): "active" | "scheduled" | "expired" | "inactive" {
  if (!coupon.isActive) return "inactive";
  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return "scheduled";
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now) return "expired";
  return "active";
}

const scheduleStyles = {
  active: "bg-green-100 text-green-800",
  scheduled: "bg-amber-100 text-amber-800",
  expired: "bg-slate-100 text-slate-600",
  inactive: "bg-red-100 text-red-800",
};

export function CouponList({ user }: CouponListProps) {
  const canCreate = hasPermission(user, "coupons.create");
  const canUpdate = hasPermission(user, "coupons.update");
  const canDelete = hasPermission(user, "coupons.delete");

  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [deleteTarget, setDeleteTarget] = useState<AdminCoupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) setCoupons(data.data);
      else toast.error("Failed to load coupons");
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.tripSlug ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? c.isActive : !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  async function handleToggle(coupon: AdminCoupon) {
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.errors?.form || "Failed to update status");
        return;
      }
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? data.data : c))
      );
      toast.success(data.data.isActive ? "Coupon activated" : "Coupon deactivated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Delete failed");
      }
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Create and manage discount codes for checkout."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/coupons/new">
                <Plus className="h-4 w-4" />
                Create coupon
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search code, trip slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "active" | "inactive")
          }
          className="sm:w-40"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Percent className="h-6 w-6" />}
          title="No coupons found"
          description="Create a coupon code for checkout discounts."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/coupons/new">Create coupon</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Discount</th>
                <th className="px-4 py-3 font-semibold">Usage</th>
                <th className="px-4 py-3 font-semibold">Schedule</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((coupon) => {
                const schedule = couponScheduleLabel(coupon);
                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-mono font-semibold tracking-wide">
                        {coupon.code}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {coupon.description || "—"}
                      </p>
                      {coupon.tripSlug ? (
                        <p className="mt-0.5 text-xs text-primary">
                          Trip: {coupon.tripSlug}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {coupon.type === "percent"
                          ? `${coupon.value}%`
                          : formatInr(coupon.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min {formatInr(coupon.minAmount)}
                        {coupon.maxDiscount != null
                          ? ` · Max ${formatInr(coupon.maxDiscount)}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {coupon.usedCount}
                        {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {coupon.usageLimit == null ? "Unlimited" : "uses"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={cn("border-0 capitalize", scheduleStyles[schedule])}>
                        {schedule}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {coupon.endsAt
                          ? `Ends ${formatDate(coupon.endsAt)}`
                          : "No end date"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {canUpdate ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggle(coupon)}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        ) : null}
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/coupons/${coupon.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(coupon)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete coupon?"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.code}? Customers will no longer be able to use it.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
