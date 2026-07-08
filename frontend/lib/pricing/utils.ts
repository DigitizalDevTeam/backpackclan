import type { ResolvedPricing } from "@/types/pricing";
import type { TripPricing } from "@/types/travel";

export const PRICE_PER_LABELS: Record<TripPricing["pricePer"], string> = {
  person: "per person",
  bike: "per bike",
  couple: "per couple",
};

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseInrInput(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function isOfferExpired(
  pricing: TripPricing,
  now: Date = new Date()
): boolean {
  if (!pricing.offerValidUntil) return false;
  return new Date(pricing.offerValidUntil) < now;
}

export function isSaleActive(
  pricing: TripPricing,
  now: Date = new Date()
): boolean {
  if (isOfferExpired(pricing, now)) return false;
  return (
    pricing.salePrice != null &&
    pricing.salePrice > 0 &&
    pricing.salePrice < pricing.basePrice
  );
}

export function resolvePricing(
  tripPricing: TripPricing,
  override?: TripPricing | null,
  source: "trip" | "departure" = "trip"
): ResolvedPricing {
  const pricing = override ?? tripPricing;
  const offerActive = isSaleActive(pricing);
  const displayPrice = offerActive ? pricing.salePrice! : pricing.basePrice;

  return {
    basePrice: pricing.basePrice,
    displayPrice,
    salePrice: offerActive ? pricing.salePrice ?? null : null,
    showStrikeThrough: offerActive && pricing.showStrikeThrough,
    offerLabel: offerActive ? pricing.offerLabel : undefined,
    offerActive,
    pricePer: pricing.pricePer,
    currency: "INR",
    source: override ? "departure" : source,
  };
}

export function defaultTripPricing(): TripPricing {
  return {
    basePrice: 0,
    salePrice: null,
    showStrikeThrough: false,
    offerLabel: "",
    offerValidUntil: null,
    currency: "INR",
    pricePer: "person",
  };
}
