import type { RiderOptionKey, RoomOptionKey } from "@/types/travel";

export type TripBadge = "Trending" | "Best Seller" | "Guaranteed" | "New";
export type TripRegion = "domestic" | "international";
export type BatchStatus = "available" | "filling_fast" | "sold_out";

export interface PublicTrip {
  id: string;
  slug: string;
  title: string;
  destination: string;
  destinationId?: string;
  destinationSlug?: string;
  duration: string;
  nights: number;
  route: string;
  price: number;
  originalPrice?: number;
  imageId: string;
  category: string;
  categoryIds?: string[];
  region: TripRegion;
  badge?: TripBadge;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  departureDates: string[];
  extraBatches?: number;
  availableMonths: string[];
}

export interface TripItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string;
  overnight?: string;
}

export interface TripBatch {
  id: string;
  date: string;
  status: BatchStatus;
  price: number;
  seatsLeft: number;
}

export interface TripReview {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  source?: "curated" | "customer";
}

export interface TripQuickFact {
  label: string;
  value: string;
}

export interface PublicPricingOptions {
  enabled: boolean;
  riderEnabled: boolean;
  roomEnabled: boolean;
  riders: { id: RiderOptionKey; label: string; price?: number }[];
  rooms: { id: RoomOptionKey; label: string; price?: number }[];
  matrix: Record<RiderOptionKey, Record<RoomOptionKey, number | null>>;
  riderPrices: Record<RiderOptionKey, number | null>;
  roomPrices: Record<RoomOptionKey, number | null>;
  startingFrom: number | null;
}

export interface TripDetailContent {
  slug: string;
  overview: string;
  overviewExtended: string;
  galleryImageIds: string[];
  quickFacts: TripQuickFact[];
  startPoint: string;
  endPoint: string;
  maxAltitude?: string;
  difficulty?: string;
  itinerary: TripItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  thingsToCarry: string[];
  faqs: { id: string; question: string; answer: string }[];
  cancellationPolicy: string[];
  refundPolicy: string[];
  batches: TripBatch[];
  reviews: TripReview[];
  addons?: TripAddon[];
  pricingOptions?: PublicPricingOptions | null;
}

export interface TripAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  pricingType: "per_person" | "flat";
}

export interface TripFilters {
  destination: string | null;
  category: string | null;
  region: TripRegion | null;
  month: string | null;
  minNights: number;
  maxNights: number;
  search: string;
}
