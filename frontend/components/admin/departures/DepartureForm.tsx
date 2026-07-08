"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { SeatStatusBadge } from "@/components/forms/travel/SeatStatusBadge";
import { PriceInput } from "@/components/forms/travel/PriceInput";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { computeEndDate, resolveDepartureStatus } from "@/lib/departures/utils";
import {
  defaultDepartureFormValues,
  departureFormSchema,
  DEPARTURE_STATUS_OPTIONS,
  type DepartureFormValues,
} from "@/lib/validations/departure";
import type { AdminTrip } from "@/types/admin-trip";
import type { AuthUser } from "@/types/auth";

interface DepartureFormProps {
  departureId?: string;
  user: AuthUser;
  defaultTripId?: string;
}

function normalizeDeparture(data: Record<string, unknown>): DepartureFormValues {
  return {
    tripId: String(data.tripId ?? ""),
    startDate: String(data.startDate ?? "").slice(0, 10),
    endDate: String(data.endDate ?? "").slice(0, 10),
    totalSeats: Number(data.totalSeats ?? 12),
    bookedSeats: Number(data.bookedSeats ?? 0),
    isGuaranteed: Boolean(data.isGuaranteed),
    isBookingClosedManual: Boolean(data.isBookingClosedManual),
    bookingClosedAt: (data.bookingClosedAt as string | null) ?? null,
    isCancelled: Boolean(data.isCancelled),
    cancellationDeadline: data.cancellationDeadline
      ? String(data.cancellationDeadline).slice(0, 10)
      : null,
    pricingOverride: (data.pricingOverride as DepartureFormValues["pricingOverride"]) ?? null,
    internalNotes: String(data.internalNotes ?? ""),
    statusOverride: (data.statusOverride as DepartureFormValues["statusOverride"]) ?? null,
    statusOverrideReason: String(data.statusOverrideReason ?? ""),
  };
}

export function DepartureForm({
  departureId,
  user,
  defaultTripId = "",
}: DepartureFormProps) {
  const router = useRouter();
  const isEdit = !!departureId;
  const canWrite = hasPermission(
    user,
    isEdit ? "departures.update" : "departures.create"
  );
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [trips, setTrips] = useState<AdminTrip[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<DepartureFormValues>({
    resolver: zodResolver(departureFormSchema) as Resolver<DepartureFormValues>,
    defaultValues: defaultDepartureFormValues(defaultTripId),
  });

  const tripId = watch("tripId");
  const startDate = watch("startDate");
  const totalSeats = watch("totalSeats");
  const bookedSeats = watch("bookedSeats");
  const isGuaranteed = watch("isGuaranteed");
  const isBookingClosedManual = watch("isBookingClosedManual");
  const bookingClosedAt = watch("bookingClosedAt");
  const isCancelled = watch("isCancelled");
  const cancellationDeadline = watch("cancellationDeadline");
  const statusOverride = watch("statusOverride");
  const pricingOverride = watch("pricingOverride");
  const usePricingOverride = pricingOverride != null;

  useUnsavedChanges(isDirty && !readOnly);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === tripId),
    [trips, tripId]
  );

  const previewStatus = useMemo(
    () =>
      resolveDepartureStatus({
        totalSeats: Number(totalSeats) || 0,
        bookedSeats: Number(bookedSeats) || 0,
        isGuaranteed,
        isBookingClosedManual,
        bookingClosedAt,
        isCancelled,
        cancellationDeadline,
        statusOverride,
      }),
    [
      totalSeats,
      bookedSeats,
      isGuaranteed,
      isBookingClosedManual,
      bookingClosedAt,
      isCancelled,
      cancellationDeadline,
      statusOverride,
    ]
  );

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/admin/trips");
        const result = await res.json();
        if (result.success) setTrips(result.data);
      } catch {
        // non-blocking
      }
    }
    loadTrips();
  }, []);

  useEffect(() => {
    if (!selectedTrip || !startDate) return;
    const endDate = computeEndDate(startDate, selectedTrip.durationNights);
    setValue("endDate", endDate, { shouldDirty: true });
  }, [selectedTrip, startDate, setValue]);

  useEffect(() => {
    if (!departureId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/departures/${departureId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Departure not found");
          router.push("/admin/departures");
          return;
        }
        reset(normalizeDeparture(result.data));
      } catch {
        toast.error("Failed to load departure");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [departureId, reset, router]);

  async function onSubmit(data: DepartureFormValues) {
    setSubmitting(true);
    const payload = {
      ...data,
      bookingClosedAt: data.bookingClosedAt || null,
      cancellationDeadline: data.cancellationDeadline || null,
    };
    try {
      const url = isEdit
        ? `/api/admin/departures/${departureId}`
        : "/api/admin/departures";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        const msg =
          result.errors?.form ??
          Object.values(result.errors ?? {})[0] ??
          "Save failed";
        toast.error(String(msg));
        return;
      }
      toast.success(isEdit ? "Departure updated" : "Departure created");
      router.push(
        data.tripId
          ? `/admin/trips/${data.tripId}/departures`
          : "/admin/departures"
      );
    } catch {
      toast.error("Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  const publishedTrips = trips.filter((t) => t.status === "published");

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Departure" : "New Departure"}
        description="Schedule a departure with seat inventory and status rules."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/departures">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tripId">Trip</Label>
              <Select
                id="tripId"
                {...register("tripId")}
                disabled={readOnly || isEdit}
              >
                <option value="">Select trip…</option>
                {publishedTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
              </Select>
              {errors.tripId && (
                <p className="text-sm text-destructive">{errors.tripId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  disabled={readOnly}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  disabled
                  className="bg-muted"
                />
                {selectedTrip && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from {selectedTrip.durationNights} nights
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalSeats">Total seats</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min={1}
                  {...register("totalSeats")}
                  disabled={readOnly}
                />
                {errors.totalSeats && (
                  <p className="text-sm text-destructive">{errors.totalSeats.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookedSeats">Booked seats</Label>
                <Input
                  id="bookedSeats"
                  type="number"
                  min={0}
                  {...register("bookedSeats")}
                  disabled={readOnly}
                />
                {errors.bookedSeats && (
                  <p className="text-sm text-destructive">{errors.bookedSeats.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Computed status:</span>
              <SeatStatusBadge status={previewStatus} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium">Flags & deadlines</h3>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("isGuaranteed")}
                disabled={readOnly}
                className="rounded border-input"
              />
              Guaranteed departure
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("isBookingClosedManual")}
                disabled={readOnly}
                className="rounded border-input"
              />
              Booking closed (manual)
            </label>

            <div className="space-y-2">
              <Label htmlFor="bookingClosedAt">Booking closed date</Label>
              <Input
                id="bookingClosedAt"
                type="date"
                {...register("bookingClosedAt")}
                disabled={readOnly}
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register("isCancelled")}
                disabled={readOnly}
                className="rounded border-input"
              />
              Cancelled
            </label>

            <div className="space-y-2">
              <Label htmlFor="cancellationDeadline">Cancellation deadline</Label>
              <Input
                id="cancellationDeadline"
                type="date"
                {...register("cancellationDeadline")}
                disabled={readOnly}
              />
              {errors.cancellationDeadline && (
                <p className="text-sm text-destructive">
                  {errors.cancellationDeadline.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium">Pricing override</h3>
            <p className="text-sm text-muted-foreground">
              Optionally set departure-specific pricing instead of the trip default.
            </p>

            {selectedTrip && (
              <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Trip default</p>
                <PriceDisplay pricing={selectedTrip.pricing} size="sm" />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={usePricingOverride}
                onChange={(e) => {
                  if (e.target.checked && selectedTrip) {
                    setValue(
                      "pricingOverride",
                      { ...selectedTrip.pricing },
                      { shouldDirty: true }
                    );
                  } else {
                    setValue("pricingOverride", null, { shouldDirty: true });
                  }
                }}
                disabled={readOnly || !selectedTrip}
                className="rounded border-input"
              />
              Use departure-specific pricing
            </label>

            {usePricingOverride && pricingOverride && (
              <div className="space-y-3">
                <PriceInput
                  pricing={pricingOverride}
                  onChange={(p) =>
                    setValue("pricingOverride", p, { shouldDirty: true })
                  }
                  disabled={readOnly}
                />
                {selectedTrip && (
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Effective display price
                    </p>
                    <PriceDisplay
                      pricing={selectedTrip.pricing}
                      override={pricingOverride}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-medium">Status override</h3>
            <p className="text-sm text-muted-foreground">
              Override the auto-computed seat status with a manual value and reason.
            </p>

            <div className="space-y-2">
              <Label htmlFor="statusOverride">Override status</Label>
              <Controller
                control={control}
                name="statusOverride"
                render={({ field }) => (
                  <Select
                    id="statusOverride"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.value : null)
                    }
                    disabled={readOnly}
                  >
                    <option value="">Auto (from seats)</option>
                    {DEPARTURE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusOverrideReason">Override reason</Label>
              <Input
                id="statusOverrideReason"
                {...register("statusOverrideReason")}
                disabled={readOnly}
                placeholder="Why this status was set manually"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internalNotes">Internal notes</Label>
              <Textarea
                id="internalNotes"
                rows={4}
                {...register("internalNotes")}
                disabled={readOnly}
                placeholder="Ops notes — not shown on public site"
              />
            </div>
          </CardContent>
        </Card>

        {canWrite && (
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create departure"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/departures">Cancel</Link>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
