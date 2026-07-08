import { addDays, format, isBefore, parseISO, startOfDay } from "date-fns";
import type { Departure, DepartureInput } from "@/types/departure";
import type { AdminTrip } from "@/types/admin-trip";
import type { DepartureStatus } from "@/types/travel";
import { computeDepartureStatus } from "@/components/forms/travel/SeatStatusBadge";

export function computeEndDate(startDate: string, durationNights: number): string {
  const start = parseISO(startDate.slice(0, 10));
  return format(addDays(start, durationNights), "yyyy-MM-dd");
}

export function getAvailableSeats(total: number, booked: number): number {
  return Math.max(0, total - booked);
}

export function resolveDepartureStatus(
  departure: Pick<
    Departure,
    | "totalSeats"
    | "bookedSeats"
    | "isGuaranteed"
    | "isBookingClosedManual"
    | "bookingClosedAt"
    | "isCancelled"
    | "cancellationDeadline"
    | "statusOverride"
  >
): DepartureStatus {
  const validStatuses: DepartureStatus[] = [
    "available",
    "limited",
    "last_few",
    "sold_out",
    "guaranteed",
    "booking_closed",
    "cancelled",
  ];

  if (
    departure.statusOverride &&
    validStatuses.includes(departure.statusOverride as DepartureStatus)
  ) {
    return departure.statusOverride;
  }

  const now = startOfDay(new Date());
  const bookingClosed =
    departure.isBookingClosedManual ||
    (departure.bookingClosedAt
      ? !isBefore(now, startOfDay(parseISO(departure.bookingClosedAt.slice(0, 10))))
      : false) ||
    (departure.cancellationDeadline
      ? isBefore(startOfDay(parseISO(departure.cancellationDeadline.slice(0, 10))), now)
      : false);

  return computeDepartureStatus(
    Number(departure.totalSeats) || 0,
    Number(departure.bookedSeats) || 0,
    {
      isGuaranteed: departure.isGuaranteed,
      bookingClosed,
      cancelled: departure.isCancelled,
    }
  );
}

export function enrichDeparture(
  departure: Departure,
  tripTitle: string
): Departure & {
  tripTitle: string;
  availableSeats: number;
  effectiveStatus: DepartureStatus;
} {
  const availableSeats = getAvailableSeats(departure.totalSeats, departure.bookedSeats);
  return {
    ...departure,
    tripTitle,
    availableSeats,
    effectiveStatus: resolveDepartureStatus(departure),
  };
}

export function buildDepartureInputFromTrip(
  trip: AdminTrip,
  startDate: string,
  totalSeats: number,
  partial?: Partial<DepartureInput>
): DepartureInput {
  return {
    tripId: trip.id,
    startDate: startDate.slice(0, 10),
    endDate: computeEndDate(startDate, trip.durationNights),
    totalSeats,
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
    ...partial,
  };
}
