import type { PublishStatus, TripPricing } from "@/types/travel";

export interface ResolvedPricing {
  basePrice: number;
  displayPrice: number;
  salePrice: number | null;
  showStrikeThrough: boolean;
  offerLabel?: string;
  offerActive: boolean;
  pricePer: TripPricing["pricePer"];
  currency: "INR";
  source: "trip" | "departure";
}

export interface TripPricingSummary {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  pricing: TripPricing;
  departuresWithOverride: number;
  resolved: ResolvedPricing;
}

export interface DeparturePricingSummary {
  id: string;
  tripId: string;
  tripTitle: string;
  startDate: string;
  endDate: string;
  tripPricing: TripPricing;
  pricingOverride: TripPricing;
  resolved: ResolvedPricing;
}
