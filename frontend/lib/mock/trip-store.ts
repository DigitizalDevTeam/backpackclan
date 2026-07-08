import type { PublicTrip } from "@/types/trip";
import {
  getAdminTripBySlug,
  getPublishedPublicTrips,
} from "@/lib/mock/admin-trip-store";

/** Thin wrapper — public trips are derived from published admin trips. */
export function getAllTrips(): PublicTrip[] {
  return getPublishedPublicTrips();
}

export function getFeaturedTrips(limit = 6): PublicTrip[] {
  return getPublishedPublicTrips()
    .filter((t) => t.isFeatured)
    .slice(0, limit);
}

export function getTripBySlug(slug: string): PublicTrip | null {
  return getPublishedPublicTrips().find((t) => t.slug === slug) ?? null;
}

export function getTripDestinations(): string[] {
  return [...new Set(getAllTrips().map((t) => t.destination))].sort();
}

export function getTripCategories(): string[] {
  return [...new Set(getAllTrips().map((t) => t.category))].sort();
}

export { getAdminTripBySlug };
