"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Pencil,
  Plus,
  Receipt,
  Search,
  Ticket,
  XCircle,
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
import { formatInr, formatDate } from "@/lib/site/format";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import type { AdminBooking, AdminBookingStatus } from "@/types/admin-booking";

const statusStyles: Record<AdminBookingStatus, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-slate-100 text-slate-700",
};

interface BookingListProps {
  user: AuthUser;
}

export function BookingList({ user }: BookingListProps) {
  const canCreate = hasPermission(user, "bookings.create");
  const canUpdate = hasPermission(user, "bookings.update");
  const canDelete = hasPermission(user, "bookings.delete");
  const canView = hasPermission(user, "bookings.view");

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminBookingStatus | "all">("all");
  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return bookings.filter((b) => {
      const matchesSearch =
        b.bookingRef.toLowerCase().includes(q) ||
        b.tripTitle.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        (b.customer?.name ?? "").toLowerCase().includes(q) ||
        (b.customer?.email ?? b.contactEmail ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  async function handleDownload(
    booking: AdminBooking,
    type: "invoice" | "voucher"
  ) {
    setDownloadingId(`${booking.id}-${type}`);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/${type}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename =
        match?.[1] ??
        (type === "invoice"
          ? `${booking.invoiceNumber}.pdf`
          : `${booking.voucherCode}.pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type === "invoice" ? "Invoice" : "Voucher"} downloaded`);
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/admin/bookings/${cancelTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Cancel failed");
      }
      toast.success("Booking cancelled");
      setCancelTarget(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Cancel failed");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Manage customer trip bookings, payments, and statuses."
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/admin/bookings/new">
                <Plus className="h-4 w-4" />
                Create booking
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
            placeholder="Search ref, trip, customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AdminBookingStatus | "all")
          }
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title="No bookings found"
          description="Create a booking for a customer or wait for checkout submissions."
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/admin/bookings/new">Create booking</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Booking</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Trip / batch</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium">{booking.bookingRef}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {booking.customer?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.customer?.email ?? booking.contactEmail ?? "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{booking.tripTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.batchDate)} · {booking.travelers} pax
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{formatInr(booking.totalAmount)}</p>
                    <p
                      className={cn(
                        "text-xs",
                        booking.balanceDue > 0
                          ? "text-orange-600"
                          : "text-emerald-600"
                      )}
                    >
                      {booking.balanceDue > 0
                        ? `${formatInr(booking.balanceDue)} due`
                        : "Paid"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={cn("border-0 capitalize", statusStyles[booking.status])}>
                      {booking.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {canView ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download invoice"
                            disabled={downloadingId !== null}
                            onClick={() => handleDownload(booking, "invoice")}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download voucher"
                            disabled={downloadingId !== null}
                            onClick={() => handleDownload(booking, "voucher")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                      {canUpdate ? (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/bookings/${booking.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/bookings/${booking.id}`}>View</Link>
                        </Button>
                      )}
                      {canDelete && booking.status !== "cancelled" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setCancelTarget(booking)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel booking?"
        description={
          cancelTarget
            ? `Cancel ${cancelTarget.bookingRef}? Seats will be released.`
            : ""
        }
        confirmLabel="Cancel booking"
        loading={cancelling}
        onConfirm={confirmCancel}
        variant="destructive"
      />
    </div>
  );
}
