import type {
  DeparturePricingSummary,
  TripPricingSummary,
} from "@/types/pricing";
import type { TripPricing } from "@/types/travel";
import {
  getAdminTripById,
  getAllAdminTrips,
  updateAdminTrip,
} from "@/lib/mock/admin-trip-store";
import { getAllDepartures } from "@/lib/mock/departure-store";
import { logActivity } from "@/lib/mock/activity-store";
import { resolvePricing } from "@/lib/pricing/utils";

function getTripTitle(tripId: string): string {
  return getAdminTripById(tripId)?.title ?? "Unknown trip";
}

export function getPricingOverview(): {
  trips: TripPricingSummary[];
  departureOverrides: DeparturePricingSummary[];
} {
  const trips = getAllAdminTrips()
    .map((trip) => {
      const overrideCount = getAllDepartures().filter(
        (d) => d.tripId === trip.id && d.pricingOverride != null
      ).length;

      return {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        status: trip.status,
        pricing: trip.pricing,
        departuresWithOverride: overrideCount,
        resolved: resolvePricing(trip.pricing),
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  const departureOverrides: DeparturePricingSummary[] = getAllDepartures()
    .filter((d) => d.pricingOverride != null)
    .map((d) => {
      const trip = getAdminTripById(d.tripId);
      const tripPricing = trip?.pricing ?? d.pricingOverride!;
      return {
        id: d.id,
        tripId: d.tripId,
        tripTitle: getTripTitle(d.tripId),
        startDate: d.startDate,
        endDate: d.endDate,
        tripPricing,
        pricingOverride: d.pricingOverride!,
        resolved: resolvePricing(tripPricing, d.pricingOverride),
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return { trips, departureOverrides };
}

export function updateTripPricing(tripId: string, pricing: TripPricing) {
  const trip = getAdminTripById(tripId);
  if (!trip) throw new Error("Trip not found");

  const { id: _id, createdAt, updatedAt, departuresCount, ...input } = trip;
  const result = updateAdminTrip(tripId, { ...input, pricing });
  logActivity(`Pricing updated for "${result.title}"`, "pricing");
  return result;
}
