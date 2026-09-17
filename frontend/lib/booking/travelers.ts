import type { PublicTrip } from "@/types/trip";

/** Maximum travelers selectable in public booking flows */
export const MAX_BOOKING_TRAVELERS = 12;

export function isInternationalTrip(trip: Pick<PublicTrip, "region">): boolean {
  return trip.region === "international";
}

export function travelerCountOptions(max = MAX_BOOKING_TRAVELERS): number[] {
  const safeMax = Math.max(1, Math.floor(max));
  return Array.from({ length: safeMax }, (_, index) => index + 1);
}

export function maxTravelersForBatch(
  seatsLeft: number | undefined,
  cap = MAX_BOOKING_TRAVELERS
): number {
  const seatCap =
    typeof seatsLeft === "number" && Number.isFinite(seatsLeft) && seatsLeft > 0
      ? Math.floor(seatsLeft)
      : cap;
  return Math.max(1, Math.min(cap, seatCap));
}

export function normalizeInternationalPax(
  adults: number,
  children: number
): { adults: number; children: number } {
  const total = Math.max(1, Math.min(MAX_BOOKING_TRAVELERS, adults + children));
  return { adults: total, children: 0 };
}

export function groupSizeLabel(
  quickFacts: { label: string; value: string }[],
  isInternational: boolean
): string {
  const maxGroup = quickFacts.find((fact) => fact.label === "Max group")?.value?.trim();
  if (maxGroup && maxGroup !== "—") {
    return `Up to ${maxGroup} travellers`;
  }
  return isInternational ? "Flexible group size" : "Small group departures";
}
