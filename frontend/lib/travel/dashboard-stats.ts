import { getPublishedAdminTrips } from "@/lib/mock/admin-trip-store";
import { getAllDepartures, getDeparturesEnriched } from "@/lib/mock/departure-store";

export interface LowSeatAlert {
  id: string;
  tripId: string;
  tripTitle: string;
  startDate: string;
  availableSeats: number;
  totalSeats: number;
}

export function getPublishedTripCount(): number {
  return getPublishedAdminTrips().length;
}

export function getUpcomingDeparturesCount(fromDate = "2026-07-01"): number {
  return getAllDepartures().filter(
    (d) => !d.isCancelled && d.startDate >= fromDate.slice(0, 10)
  ).length;
}

export function getLowSeatAlerts(threshold = 5): LowSeatAlert[] {
  const today = new Date().toISOString().slice(0, 10);
  return getDeparturesEnriched()
    .filter(
      (d) =>
        !d.isCancelled &&
        d.startDate >= today &&
        d.availableSeats > 0 &&
        d.availableSeats <= threshold
    )
    .sort((a, b) => a.availableSeats - b.availableSeats)
    .slice(0, 10)
    .map((d) => ({
      id: d.id,
      tripId: d.tripId,
      tripTitle: d.tripTitle,
      startDate: d.startDate,
      availableSeats: d.availableSeats,
      totalSeats: d.totalSeats,
    }));
}
