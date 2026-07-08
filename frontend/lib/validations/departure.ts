import { z } from "zod";
import type { DepartureStatus } from "@/types/travel";

const statusEnum = z.enum([
  "available",
  "limited",
  "last_few",
  "sold_out",
  "guaranteed",
  "booking_closed",
  "cancelled",
]);

const pricingOverrideSchema = z
  .object({
    basePrice: z.number().min(0),
    salePrice: z.number().nullable().optional(),
    showStrikeThrough: z.boolean(),
    offerLabel: z.string().optional(),
    offerValidUntil: z.string().nullable().optional(),
    currency: z.literal("INR"),
    pricePer: z.enum(["person", "bike", "couple"]),
  })
  .nullable();

export const departureFormSchema = z
  .object({
    tripId: z.string().min(1, "Trip is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    totalSeats: z.coerce.number().min(1, "At least 1 seat required"),
    bookedSeats: z.coerce.number().min(0),
    isGuaranteed: z.boolean(),
    isBookingClosedManual: z.boolean(),
    bookingClosedAt: z.string().nullable(),
    isCancelled: z.boolean(),
    cancellationDeadline: z.string().nullable(),
    pricingOverride: pricingOverrideSchema,
    internalNotes: z.string(),
    statusOverride: statusEnum.nullable(),
    statusOverrideReason: z.string(),
  })
  .refine((d) => d.bookedSeats <= d.totalSeats, {
    message: "Booked seats cannot exceed total seats",
    path: ["bookedSeats"],
  })
  .refine(
    (d) => {
      if (!d.cancellationDeadline || !d.startDate) return true;
      return d.cancellationDeadline <= d.startDate;
    },
    {
      message: "Cancellation deadline must be on or before start date",
      path: ["cancellationDeadline"],
    }
  );

export type DepartureFormValues = z.infer<typeof departureFormSchema>;

export const bulkDepartureSchema = z.object({
  tripId: z.string().min(1),
  rangeStart: z.string().min(1),
  rangeEnd: z.string().min(1),
  recurrence: z.enum(["weekly", "biweekly"]),
  totalSeats: z.coerce.number().min(1),
});

export type BulkDepartureFormValues = z.infer<typeof bulkDepartureSchema>;

export function defaultDepartureFormValues(tripId = ""): DepartureFormValues {
  return {
    tripId,
    startDate: "",
    endDate: "",
    totalSeats: 12,
    bookedSeats: 0,
    isGuaranteed: false,
    isBookingClosedManual: false,
    bookingClosedAt: null,
    isCancelled: false,
    cancellationDeadline: null,
    pricingOverride: null,
    internalNotes: "",
    statusOverride: null,
    statusOverrideReason: "",
  };
}

export const DEPARTURE_STATUS_OPTIONS: { value: DepartureStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited Seats" },
  { value: "last_few", label: "Last Few Seats" },
  { value: "sold_out", label: "Sold Out" },
  { value: "guaranteed", label: "Guaranteed Departure" },
  { value: "booking_closed", label: "Booking Closed" },
  { value: "cancelled", label: "Cancelled" },
];
