"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  FileText,
  Loader2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatInr } from "@/lib/site/format";
import type { AdminBooking, AdminBookingStatus } from "@/types/admin-booking";
import type { AdminTrip } from "@/types/admin-trip";
import type { DepartureListItem } from "@/types/departure";
import type { AdminUser } from "@/types/user";

interface BookingFormProps {
  mode: "create" | "edit";
  booking?: AdminBooking;
}

export function BookingForm({ mode, booking }: BookingFormProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [departures, setDepartures] = useState<DepartureListItem[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState<"invoice" | "voucher" | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState(booking?.customerId ?? "");
  const [tripId, setTripId] = useState(booking?.tripId ?? "");
  const [departureId, setDepartureId] = useState(booking?.departureId ?? "");
  const [adults, setAdults] = useState(booking?.adults ?? 1);
  const [children, setChildren] = useState(booking?.children ?? 0);
  const [status, setStatus] = useState<AdminBookingStatus>(
    booking?.status ?? "confirmed"
  );
  const [paidAmount, setPaidAmount] = useState(booking?.paidAmount ?? 0);
  const [totalAmount, setTotalAmount] = useState(booking?.totalAmount ?? 0);
  const [recordPayment, setRecordPayment] = useState(0);
  const [recalculatePricing, setRecalculatePricing] = useState(true);
  const [contactPhone, setContactPhone] = useState(booking?.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(booking?.contactEmail ?? "");

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, tripsRes, depRes] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/trips"),
          fetch("/api/admin/departures"),
        ]);
        const [usersData, tripsData, depData] = await Promise.all([
          usersRes.json(),
          tripsRes.json(),
          depRes.json(),
        ]);
        if (usersData.success) {
          setCustomers(
            (usersData.data as AdminUser[]).filter(
              (u) =>
                u.role === "customer" ||
                u.roleName?.toLowerCase() === "customer"
            )
          );
        }
        if (tripsData.success) {
          const list = tripsData.data as AdminTrip[];
          setTrips(list);
          if (booking && !booking.tripId) {
            const match = list.find((t) => t.slug === booking.tripSlug);
            if (match) setTripId(match.id);
          }
        }
        if (depData.success) {
          const list = depData.data as DepartureListItem[];
          setDepartures(list);
          if (booking && !booking.departureId && booking.batchDate) {
            const resolvedTripId =
              booking.tripId ||
              (tripsData.success
                ? (tripsData.data as AdminTrip[]).find(
                    (t) => t.slug === booking.tripSlug
                  )?.id
                : undefined);
            const match = list.find(
              (d) =>
                d.startDate === booking.batchDate &&
                (!resolvedTripId || d.tripId === resolvedTripId)
            );
            if (match) {
              setDepartureId(match.id);
              if (!booking.tripId) setTripId(match.tripId);
            }
          }
        }
      } catch {
        toast.error("Failed to load form data");
      } finally {
        setLoadingMeta(false);
      }
    }
    load();
  }, [booking]);

  useEffect(() => {
    if (booking) {
      setPaidAmount(booking.paidAmount);
      setTotalAmount(booking.totalAmount);
      setStatus(booking.status);
      setAdults(booking.adults ?? booking.travelers);
      setChildren(booking.children ?? 0);
      setTripId(booking.tripId ?? "");
      setDepartureId(booking.departureId ?? "");
      setCustomerId(booking.customerId);
      setContactPhone(booking.contactPhone ?? "");
      setContactEmail(booking.contactEmail ?? "");
    }
  }, [booking]);

  const tripDepartures = useMemo(() => {
    return departures.filter((d) => {
      if (d.tripId !== tripId) return false;
      if (d.id === departureId) return true;
      return (
        !d.isCancelled &&
        d.effectiveStatus !== "sold_out" &&
        d.effectiveStatus !== "booking_closed"
      );
    });
  }, [departures, tripId, departureId]);

  const selectedDeparture = departures.find((d) => d.id === departureId);
  const selectedTrip = trips.find((t) => t.id === tripId);
  const unitPrice = selectedDeparture
    ? selectedDeparture.pricingOverride?.salePrice ||
      selectedDeparture.pricingOverride?.basePrice ||
      selectedTrip?.pricing?.salePrice ||
      selectedTrip?.pricing?.basePrice ||
      0
    : 0;
  const estimatedTotal = unitPrice * (adults + children);

  async function handleDownload(type: "invoice" | "voucher") {
    if (!booking) return;
    setDownloading(type);
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
      setDownloading(null);
    }
  }

  async function handleDocumentDownload(documentId: string, name: string) {
    if (!booking) return;
    setDownloadingDocId(documentId);
    try {
      const res = await fetch(
        `/api/admin/bookings/${booking.id}/documents/${documentId}/download`
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? name;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Document downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingDocId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "create") {
        if (!customerId || !tripId || !departureId) {
          toast.error("Customer, trip and departure are required");
          return;
        }
        const res = await fetch("/api/admin/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            tripId,
            departureId,
            adults,
            children,
            status,
            paidAmount,
            contactPhone: contactPhone || undefined,
            contactEmail: contactEmail || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.errors?.form || "Create failed");
        }
        toast.success("Booking created");
        router.push(`/admin/bookings/${data.data.id}`);
        router.refresh();
        return;
      }

      const res = await fetch(`/api/admin/bookings/${booking!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          tripId,
          departureId,
          status,
          adults,
          children,
          contactPhone,
          contactEmail,
          paidAmount,
          totalAmount: recalculatePricing ? undefined : totalAmount,
          recalculatePricing,
          ...(recordPayment > 0 ? { recordPaymentAmount: recordPayment } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Update failed");
      }
      toast.success("Booking updated");
      setRecordPayment(0);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loadingMeta) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          mode === "create"
            ? "Create booking"
            : `Manage ${booking?.bookingRef}`
        }
        description={
          mode === "create"
            ? "Create a booking on behalf of a customer."
            : "Change trip, customers, payments, status — download invoice & voucher."
        }
        action={
          mode === "edit" && booking ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={downloading !== null}
                onClick={() => handleDownload("invoice")}
              >
                {downloading === "invoice" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
                Invoice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={downloading !== null}
                onClick={() => handleDownload("voucher")}
              >
                {downloading === "voucher" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Voucher
              </Button>
            </div>
          ) : null
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 rounded-xl border bg-white p-6">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                const c = customers.find((x) => x.id === e.target.value);
                if (c) setContactEmail(c.email);
              }}
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Trip</Label>
              <Select
                value={tripId}
                onChange={(e) => {
                  setTripId(e.target.value);
                  setDepartureId("");
                }}
                required
              >
                <option value="">Select trip</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Departure / batch</Label>
              <Select
                value={departureId}
                onChange={(e) => setDepartureId(e.target.value)}
                required
                disabled={!tripId}
              >
                <option value="">Select departure</option>
                {tripDepartures.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.startDate} · {d.availableSeats} seats left
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Adults</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>Children</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as AdminBookingStatus)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact phone</Label>
              <Input
                value={contactPhone ?? ""}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact email</Label>
              <Input
                type="email"
                value={contactEmail ?? ""}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {mode === "create" ? "Initial paid amount" : "Paid amount"}
              </Label>
              <Input
                type="number"
                min={0}
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
              />
              {mode === "create" && estimatedTotal > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Est. total {formatInr(estimatedTotal)}
                </p>
              ) : null}
            </div>
            {mode === "edit" ? (
              <div className="space-y-2">
                <Label>Record extra payment</Label>
                <Input
                  type="number"
                  min={0}
                  value={recordPayment}
                  onChange={(e) => setRecordPayment(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Current balance {formatInr(booking?.balanceDue ?? 0)}
                </p>
              </div>
            ) : null}
          </div>

          {mode === "edit" ? (
            <div className="space-y-3 rounded-xl border bg-slate-50 p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={recalculatePricing}
                  onChange={(e) => setRecalculatePricing(e.target.checked)}
                />
                <span>
                  Recalculate total from selected trip/departure price when
                  saving
                  {estimatedTotal > 0 ? (
                    <span className="block text-xs text-muted-foreground">
                      Preview: {formatInr(estimatedTotal)} for {adults + children}{" "}
                      travelers
                    </span>
                  ) : null}
                </span>
              </label>
              {!recalculatePricing ? (
                <div className="space-y-2">
                  <Label>Manual total amount</Label>
                  <Input
                    type="number"
                    min={0}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : mode === "create" ? (
                "Create booking"
              ) : (
                "Save all changes"
              )}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/admin/bookings">Back to list</Link>
            </Button>
          </div>
        </div>

        {mode === "edit" && booking ? (
          <aside className="space-y-4">
            <div className="rounded-xl border bg-white p-5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Summary
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="capitalize">
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatInr(booking.totalAmount)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium text-emerald-700">
                    {formatInr(booking.paidAmount)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 border-t pt-2">
                  <span className="font-medium">Balance</span>
                  <span className="font-bold text-orange-600">
                    {formatInr(booking.balanceDue)}
                  </span>
                </div>
                <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>Invoice</span>
                  <span>{booking.invoiceNumber}</span>
                </div>
                <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                  <span>Voucher</span>
                  <span>{booking.voucherCode}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="mb-3 text-sm font-semibold">Payments</p>
              {(booking.payments?.length ?? 0) === 0 ? (
                <p className="text-xs text-muted-foreground">No payments recorded</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {booking.payments!.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{formatInr(p.amount)}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {p.provider} · {p.mode} · {p.status}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.paidAt ? formatDate(p.paidAt) : "—"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border bg-white p-5">
              <p className="mb-3 text-sm font-semibold">Documents</p>
              {(booking.documents?.length ?? 0) === 0 ? (
                <p className="text-xs text-muted-foreground">No documents uploaded</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {booking.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDocumentDownload(doc.id, doc.name)}
                        disabled={downloadingDocId === doc.id}
                      >
                        {downloadingDocId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        ) : null}
      </form>
    </div>
  );
}
