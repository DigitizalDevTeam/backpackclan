import type { DepartureStatus, TripPricing } from "@/types/travel";

export interface Departure {
  id: string;
  tripId: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  bookedSeats: number;
  isGuaranteed: boolean;
  isBookingClosedManual: boolean;
  bookingClosedAt: string | null;
  isCancelled: boolean;
  cancellationDeadline: string | null;
  pricingOverride: TripPricing | null;
  internalNotes: string;
  statusOverride: DepartureStatus | null;
  statusOverrideReason: string;
  createdAt: string;
  updatedAt: string;
}

export type DepartureInput = Omit<Departure, "id" | "createdAt" | "updatedAt">;

export interface DepartureListItem extends Departure {
  tripTitle: string;
  availableSeats: number;
  effectiveStatus: DepartureStatus;
}

export interface BulkDeparturePreview {
  startDate: string;
  endDate: string;
  totalSeats: number;
}

export type BulkRecurrence = "weekly" | "biweekly";

export interface BulkDepartureRequest {
  tripId: string;
  rangeStart: string;
  rangeEnd: string;
  recurrence: BulkRecurrence;
  totalSeats: number;
}
