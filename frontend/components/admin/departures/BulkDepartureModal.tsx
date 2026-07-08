"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  bulkDepartureSchema,
  type BulkDepartureFormValues,
} from "@/lib/validations/departure";
import type { BulkDeparturePreview } from "@/types/departure";
import type { AdminTrip } from "@/types/admin-trip";

interface BulkDepartureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trips: AdminTrip[];
  defaultTripId?: string;
  onSuccess: () => void;
}

export function BulkDepartureModal({
  open,
  onOpenChange,
  trips,
  defaultTripId = "",
  onSuccess,
}: BulkDepartureModalProps) {
  const [tripId, setTripId] = useState(defaultTripId);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [recurrence, setRecurrence] = useState<"weekly" | "biweekly">("weekly");
  const [totalSeats, setTotalSeats] = useState(12);
  const [preview, setPreview] = useState<BulkDeparturePreview[] | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTripId(defaultTripId);
      setPreview(null);
      setErrors({});
    }
  }, [open, defaultTripId]);

  const publishedTrips = trips.filter((t) => t.status === "published");

  function buildPayload(): BulkDepartureFormValues {
    return { tripId, rangeStart, rangeEnd, recurrence, totalSeats };
  }

  async function handlePreview() {
    const parsed = bulkDepartureSchema.safeParse(buildPayload());
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/departures/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, preview: true }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Preview failed");
        return;
      }
      setPreview(result.data);
    } catch {
      toast.error("Preview failed");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleConfirm() {
    const parsed = bulkDepartureSchema.safeParse(buildPayload());
    if (!parsed.success) {
      toast.error("Please fix validation errors");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/departures/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Bulk create failed");
        return;
      }
      toast.success(`Created ${result.data.length} departures`);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Bulk create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Departures</DialogTitle>
          <DialogDescription>
            Generate recurring departures for a trip across a date range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="bulk-trip">Trip</Label>
            <Select
              id="bulk-trip"
              value={tripId}
              onChange={(e) => {
                setTripId(e.target.value);
                setPreview(null);
              }}
            >
              <option value="">Select trip…</option>
              {publishedTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </Select>
            {errors.tripId && (
              <p className="text-sm text-destructive">{errors.tripId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bulk-start">Range start</Label>
              <Input
                id="bulk-start"
                type="date"
                value={rangeStart}
                onChange={(e) => {
                  setRangeStart(e.target.value);
                  setPreview(null);
                }}
              />
              {errors.rangeStart && (
                <p className="text-sm text-destructive">{errors.rangeStart}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-end">Range end</Label>
              <Input
                id="bulk-end"
                type="date"
                value={rangeEnd}
                onChange={(e) => {
                  setRangeEnd(e.target.value);
                  setPreview(null);
                }}
              />
              {errors.rangeEnd && (
                <p className="text-sm text-destructive">{errors.rangeEnd}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bulk-recurrence">Recurrence</Label>
              <Select
                id="bulk-recurrence"
                value={recurrence}
                onChange={(e) => {
                  setRecurrence(e.target.value as "weekly" | "biweekly");
                  setPreview(null);
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-seats">Total seats</Label>
              <Input
                id="bulk-seats"
                type="number"
                min={1}
                value={totalSeats}
                onChange={(e) => {
                  setTotalSeats(Number(e.target.value));
                  setPreview(null);
                }}
              />
              {errors.totalSeats && (
                <p className="text-sm text-destructive">{errors.totalSeats}</p>
              )}
            </div>
          </div>

          {preview && (
            <div className="rounded-md border p-3 space-y-2 max-h-48 overflow-y-auto">
              <p className="text-sm font-medium">
                Preview — {preview.length} departure{preview.length !== 1 ? "s" : ""}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {preview.map((row) => (
                  <li key={row.startDate}>
                    {format(parseISO(row.startDate), "dd MMM yyyy")} →{" "}
                    {format(parseISO(row.endDate), "dd MMM yyyy")} ({row.totalSeats} seats)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePreview}
            disabled={previewing || submitting}
          >
            {previewing && <Loader2 className="h-4 w-4 animate-spin" />}
            Preview
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!preview?.length || submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Create {preview?.length ?? 0} departures
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
