import type { PaymentMode } from "@/types/payment";
import { getCouponByCode } from "@/lib/mock/coupon-store";

export interface CouponValidation {
  code: string;
  discount: number;
  type: "percent" | "fixed";
  value: number;
  description?: string | null;
}

export const DEFAULT_TRIP_ADDONS = [
  {
    id: "travel_insurance",
    name: "Travel insurance",
    description: "Basic trip insurance covering medical & trip interruption",
    price: 999,
    pricingType: "per_person" as const,
  },
  {
    id: "gear_rental",
    name: "Gear rental pack",
    description: "Sleeping bag, trekking poles & daypack rental",
    price: 1499,
    pricingType: "per_person" as const,
  },
  {
    id: "private_room",
    name: "Private room upgrade",
    description: "Single occupancy rooms where available",
    price: 3999,
    pricingType: "flat" as const,
  },
];

export function validateMockCoupon(
  code: string,
  subtotal: number,
  tripSlug?: string
): { ok: true; data: CouponValidation } | { ok: false; error: string } {
  const coupon = getCouponByCode(code);
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Invalid or inactive coupon code" };
  }

  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return { ok: false, error: "This coupon is not active yet" };
  }
  if (coupon.endsAt && new Date(coupon.endsAt).getTime() < now) {
    return { ok: false, error: "This coupon has expired" };
  }
  if (coupon.tripSlug && tripSlug && coupon.tripSlug !== tripSlug) {
    return { ok: false, error: "This coupon is not valid for this trip" };
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit" };
  }
  if (subtotal < coupon.minAmount) {
    return { ok: false, error: "Cart total is below the minimum for this coupon" };
  }

  let discount =
    coupon.type === "percent"
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;
  if (coupon.maxDiscount != null) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.max(0, Math.min(discount, subtotal));
  if (discount <= 0) {
    return { ok: false, error: "Coupon does not apply a discount for this amount" };
  }

  return {
    ok: true,
    data: {
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    },
  };
}

export type { PaymentMode };
