export type CouponType = "percent" | "fixed";

export interface AdminCoupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  tripSlug: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minAmount?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  tripSlug?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  description?: string | null;
}
