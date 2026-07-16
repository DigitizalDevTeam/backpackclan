import type { FaqItem, ItineraryDay, PublishStatus, RepeaterItem, TestimonialItem, TripPricing } from "@/types/travel";

export type TripType = "bike" | "trek" | "road_trip" | "custom" | "mixed";
export type TripDifficulty = "easy" | "moderate" | "challenging" | "expert";

export interface TripOverview {
  content: string;
  highlights: RepeaterItem[];
  routeMapEmbed: string;
  routeMapImageId: string | null;
}

export interface TripSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageId: string | null;
  canonicalUrl: string;
  robots: string;
}

export interface AdminTrip {
  id: string;
  destinationId: string;
  categoryIds: string[];
  title: string;
  slug: string;
  tripType: TripType;
  durationDays: number;
  durationNights: number;
  difficulty: TripDifficulty;
  maxGroupSize: number;
  minAge: number | null;
  maxAltitude: string | null;
  summary: string;
  coverImageId: string | null;
  gallery: string[];
  overview: TripOverview;
  itinerary: ItineraryDay[];
  inclusions: RepeaterItem[];
  exclusions: RepeaterItem[];
  thingsToCarry: RepeaterItem[];
  cancellationPolicy: RepeaterItem[];
  refundPolicy: RepeaterItem[];
  faqs: FaqItem[];
  testimonials: TestimonialItem[];
  pricing: TripPricing;
  seo: TripSeo;
  isFeatured: boolean;
  status: PublishStatus;
  sortOrder: number;
  departuresCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AdminTripInput = Omit<
  AdminTrip,
  "id" | "createdAt" | "updatedAt" | "departuresCount"
>;

export const TRIP_TYPE_LABELS: Record<TripType, string> = {
  bike: "Bike",
  trek: "Trek",
  road_trip: "Road Trip",
  custom: "Custom",
  mixed: "Mixed",
};

export const TRIP_DIFFICULTY_LABELS: Record<TripDifficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  challenging: "Challenging",
  expert: "Expert",
};

export const INCLUSION_TEMPLATES = [
  "Accommodation",
  "Meals",
  "Permits",
  "Bike rental",
  "Guide",
  "Transport",
  "First aid kit",
] as const;
