import type { AdminCoupon, AdminCouponInput } from "@/types/admin-coupon";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";

const SEED: AdminCoupon[] = [
  {
    id: "cp1",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minAmount: 5000,
    maxDiscount: 3000,
    usageLimit: 500,
    usedCount: 12,
    tripSlug: null,
    isActive: true,
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    description: "10% off for new travelers (max ₹3,000)",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cp2",
    code: "EARLYBIRD500",
    type: "fixed",
    value: 500,
    minAmount: 10000,
    maxDiscount: null,
    usageLimit: 200,
    usedCount: 4,
    tripSlug: null,
    isActive: true,
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 180 * 86400000).toISOString(),
    description: "Flat ₹500 off early bookings",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cp3",
    code: "LADAKH15",
    type: "percent",
    value: 15,
    minAmount: 15000,
    maxDiscount: 5000,
    usageLimit: 100,
    usedCount: 8,
    tripSlug: "leh-ladakh-bike-expedition",
    isActive: true,
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    description: "15% off Ladakh bike expedition",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

let coupons: AdminCoupon[] | null = null;

function getStore(): AdminCoupon[] {
  if (!coupons) {
    coupons = loadMockData("coupons", structuredClone(SEED));
  }
  return coupons;
}

function persist(): void {
  if (coupons) saveMockData("coupons", coupons);
}

export function getAllCoupons(): AdminCoupon[] {
  return [...getStore()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getCouponById(id: string): AdminCoupon | null {
  return getStore().find((c) => c.id === id) ?? null;
}

export function getCouponByCode(code: string): AdminCoupon | null {
  const normalized = code.trim().toUpperCase();
  return getStore().find((c) => c.code.toUpperCase() === normalized) ?? null;
}

export function createCoupon(
  input: AdminCouponInput
): { ok: true; coupon: AdminCoupon } | { ok: false; error: string } {
  const code = input.code.trim().toUpperCase();
  if (getCouponByCode(code)) {
    return { ok: false, error: "Coupon code already exists" };
  }
  if (input.type === "percent" && input.value > 100) {
    return { ok: false, error: "Percent value cannot exceed 100" };
  }

  const now = new Date().toISOString();
  const coupon: AdminCoupon = {
    id: `cp${Date.now()}`,
    code,
    type: input.type,
    value: input.value,
    minAmount: input.minAmount ?? 0,
    maxDiscount: input.maxDiscount ?? null,
    usageLimit: input.usageLimit ?? null,
    usedCount: 0,
    tripSlug: input.tripSlug?.trim() || null,
    isActive: input.isActive ?? true,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  };

  coupons = [coupon, ...getStore()];
  persist();
  return { ok: true, coupon };
}

export function updateCoupon(
  id: string,
  input: AdminCouponInput
): { ok: true; coupon: AdminCoupon } | { ok: false; error: string } {
  const index = getStore().findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, error: "Coupon not found" };

  const code = input.code.trim().toUpperCase();
  const duplicate = getStore().find(
    (c) => c.id !== id && c.code.toUpperCase() === code
  );
  if (duplicate) return { ok: false, error: "Coupon code already exists" };
  if (input.type === "percent" && input.value > 100) {
    return { ok: false, error: "Percent value cannot exceed 100" };
  }

  const current = getStore()[index];
  const updated: AdminCoupon = {
    ...current,
    code,
    type: input.type,
    value: input.value,
    minAmount: input.minAmount ?? 0,
    maxDiscount: input.maxDiscount ?? null,
    usageLimit: input.usageLimit ?? null,
    tripSlug: input.tripSlug?.trim() || null,
    isActive: input.isActive ?? current.isActive,
    startsAt: input.startsAt ?? null,
    endsAt: input.endsAt ?? null,
    description: input.description ?? null,
    updatedAt: new Date().toISOString(),
  };

  coupons = [
    ...getStore().slice(0, index),
    updated,
    ...getStore().slice(index + 1),
  ];
  persist();
  return { ok: true, coupon: updated };
}

export function toggleCoupon(id: string): AdminCoupon | null {
  const index = getStore().findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated: AdminCoupon = {
    ...getStore()[index],
    isActive: !getStore()[index].isActive,
    updatedAt: new Date().toISOString(),
  };
  coupons = [
    ...getStore().slice(0, index),
    updated,
    ...getStore().slice(index + 1),
  ];
  persist();
  return updated;
}

export function resetCouponUsage(id: string): AdminCoupon | null {
  const index = getStore().findIndex((c) => c.id === id);
  if (index === -1) return null;
  const updated: AdminCoupon = {
    ...getStore()[index],
    usedCount: 0,
    updatedAt: new Date().toISOString(),
  };
  coupons = [
    ...getStore().slice(0, index),
    updated,
    ...getStore().slice(index + 1),
  ];
  persist();
  return updated;
}

export function deleteCoupon(id: string): boolean {
  const before = getStore().length;
  coupons = getStore().filter((c) => c.id !== id);
  if (coupons.length === before) return false;
  persist();
  return true;
}

export function incrementCouponUsage(code: string): void {
  const index = getStore().findIndex(
    (c) => c.code.toUpperCase() === code.trim().toUpperCase()
  );
  if (index === -1) return;
  const updated: AdminCoupon = {
    ...getStore()[index],
    usedCount: getStore()[index].usedCount + 1,
    updatedAt: new Date().toISOString(),
  };
  coupons = [
    ...getStore().slice(0, index),
    updated,
    ...getStore().slice(index + 1),
  ];
  persist();
}
