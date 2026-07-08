import { addDays, addWeeks, format, parseISO } from "date-fns";
import type {
  BulkDepartureRequest,
  Departure,
  DepartureInput,
  DepartureListItem,
} from "@/types/departure";
import type { CalendarDeparture } from "@/types/travel";
import { getAdminTripById, getAllAdminTrips } from "@/lib/mock/admin-trip-store";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";
import {
  buildDepartureInputFromTrip,
  computeEndDate,
  enrichDeparture,
  resolveDepartureStatus,
} from "@/lib/departures/utils";

function generateId(): string {
  return `dep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildSeedDepartures(): Departure[] {
  const trips = getAllAdminTrips().filter((t) => t.status === "published");
  const departures: Departure[] = [];
  const base = parseISO("2026-07-01");
  let counter = 0;

  const seatProfiles = [
    { total: 12, booked: 2 },
    { total: 12, booked: 8 },
    { total: 12, booked: 11 },
    { total: 12, booked: 12 },
    { total: 18, booked: 5 },
    { total: 18, booked: 15 },
    { total: 10, booked: 1 },
    { total: 10, booked: 9 },
  ];

  for (const trip of trips.slice(0, 6)) {
    for (let week = 0; week < 6; week++) {
      const profile = seatProfiles[counter % seatProfiles.length];
      const start = addWeeks(base, week + (trips.indexOf(trip) % 2));
      const startStr = format(start, "yyyy-MM-dd");
      const now = "2026-02-15T10:00:00.000Z";
      const pricingOverride =
        counter % 9 === 0
          ? {
              basePrice: trip.pricing.basePrice,
              salePrice: Math.round(trip.pricing.basePrice * 0.85),
              showStrikeThrough: true,
              offerLabel: "Departure Special",
              offerValidUntil: format(addDays(start, -1), "yyyy-MM-dd") + "T23:59:59.000Z",
              currency: "INR" as const,
              pricePer: trip.pricing.pricePer,
            }
          : null;

      departures.push({
        id: `dep-seed-${++counter}`,
        tripId: trip.id,
        startDate: startStr,
        endDate: computeEndDate(startStr, trip.durationNights),
        totalSeats: profile.total,
        bookedSeats: profile.booked,
        isGuaranteed: week % 4 === 0,
        isBookingClosedManual: false,
        bookingClosedAt: null,
        isCancelled: week === 5 && trips.indexOf(trip) === 0,
        cancellationDeadline: format(addDays(start, -7), "yyyy-MM-dd"),
        pricingOverride,
        internalNotes: "",
        statusOverride: null,
        statusOverrideReason: "",
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return departures;
}

const departureStore = createPersistedStore("departures", buildSeedDepartures());

function getTripTitle(tripId: string): string {
  return getAdminTripById(tripId)?.title ?? "Unknown trip";
}

export function getAllDepartures(): Departure[] {
  return [...departureStore.get()].sort(
    (a, b) => a.startDate.localeCompare(b.startDate)
  );
}

export function getDeparturesEnriched(): DepartureListItem[] {
  return getAllDepartures().map((d) =>
    enrichDeparture(d, getTripTitle(d.tripId))
  );
}

export function getDeparturesByTripId(tripId: string): DepartureListItem[] {
  return getDeparturesEnriched().filter((d) => d.tripId === tripId);
}

export function getDepartureCountByTripId(tripId: string): number {
  return departureStore.get().filter((d) => d.tripId === tripId).length;
}

export function getDepartureById(id: string): Departure | null {
  return departureStore.get().find((d) => d.id === id) ?? null;
}

export function getCalendarDepartures(month: string): CalendarDeparture[] {
  const [year, mon] = month.split("-").map(Number);
  const prefix = `${year}-${String(mon).padStart(2, "0")}`;

  return getDeparturesEnriched()
    .filter((d) => d.startDate.startsWith(prefix))
    .map((d) => ({
      id: d.id,
      tripId: d.tripId,
      tripTitle: d.tripTitle,
      startDate: d.startDate,
      endDate: d.endDate,
      totalSeats: d.totalSeats,
      bookedSeats: d.bookedSeats,
      status: d.effectiveStatus,
    }));
}

export function createDeparture(data: DepartureInput): Departure {
  if (data.bookedSeats > data.totalSeats) {
    throw new Error("Booked seats cannot exceed total seats");
  }

  const now = new Date().toISOString();
  const departure: Departure = {
    id: generateId(),
    ...data,
    startDate: data.startDate.slice(0, 10),
    endDate: data.endDate.slice(0, 10),
    createdAt: now,
    updatedAt: now,
  };
  departureStore.set([...departureStore.get(), departure]);
  logActivity(`New departure for trip ${getTripTitle(data.tripId)}`, "departures");
  return departure;
}

export function updateDeparture(id: string, data: DepartureInput): Departure {
  const departures = departureStore.get();
  const index = departures.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Departure not found");
  if (data.bookedSeats > data.totalSeats) {
    throw new Error("Booked seats cannot exceed total seats");
  }

  const updated: Departure = {
    ...departures[index],
    ...data,
    startDate: data.startDate.slice(0, 10),
    endDate: data.endDate.slice(0, 10),
    updatedAt: new Date().toISOString(),
  };
  departureStore.set([
    ...departures.slice(0, index),
    updated,
    ...departures.slice(index + 1),
  ]);
  logActivity(`Departure updated for ${getTripTitle(data.tripId)}`, "departures");
  return updated;
}

export function deleteDeparture(id: string): void {
  const departures = departureStore.get();
  const dep = departures.find((d) => d.id === id);
  if (!dep) throw new Error("Departure not found");
  departureStore.set(departures.filter((d) => d.id !== id));
  logActivity(`Departure deleted for ${getTripTitle(dep.tripId)}`, "departures");
}

export function previewBulkDepartures(
  request: BulkDepartureRequest
): { startDate: string; endDate: string; totalSeats: number }[] {
  const trip = getAdminTripById(request.tripId);
  if (!trip) throw new Error("Trip not found");

  const rows: { startDate: string; endDate: string; totalSeats: number }[] = [];
  let current = parseISO(request.rangeStart.slice(0, 10));
  const end = parseISO(request.rangeEnd.slice(0, 10));
  const step = request.recurrence === "weekly" ? 1 : 2;

  while (current <= end) {
    const startStr = format(current, "yyyy-MM-dd");
    rows.push({
      startDate: startStr,
      endDate: computeEndDate(startStr, trip.durationNights),
      totalSeats: request.totalSeats,
    });
    current = addWeeks(current, step);
  }

  return rows;
}

export function createBulkDepartures(request: BulkDepartureRequest): Departure[] {
  const trip = getAdminTripById(request.tripId);
  if (!trip) throw new Error("Trip not found");

  const preview = previewBulkDepartures(request);
  const created: Departure[] = [];

  for (const row of preview) {
    created.push(
      createDeparture(
        buildDepartureInputFromTrip(trip, row.startDate, row.totalSeats)
      )
    );
  }

  logActivity(`Bulk created ${created.length} departures`, "departures");
  return created;
}

export { resolveDepartureStatus };
