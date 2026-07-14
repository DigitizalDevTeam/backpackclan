import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createCoupon, getAllCoupons } from "@/lib/mock/coupon-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminCouponInput } from "@/types/admin-coupon";

export async function GET(request: Request) {
  const { error, session } = await requirePermission("coupons.view");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const active = searchParams.get("active");
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (active != null && active !== "") qs.set("active", active);
  const query = qs.toString() ? `?${qs}` : "";

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/coupons${query}`);
  }

  await mockDelay(200);
  let data = getAllCoupons();
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        (c.tripSlug ?? "").toLowerCase().includes(q)
    );
  }
  if (active === "true") data = data.filter((c) => c.isActive);
  if (active === "false") data = data.filter((c) => !c.isActive);

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("coupons.create");
  if (error) return error;

  try {
    const body = (await request.json()) as AdminCouponInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/coupons", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(300);
    const result = createCoupon(body);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: true, data: result.coupon }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create coupon";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
