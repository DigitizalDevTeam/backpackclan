import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteCoupon,
  getCouponById,
  resetCouponUsage,
  toggleCoupon,
  updateCoupon,
} from "@/lib/mock/coupon-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminCouponInput } from "@/types/admin-coupon";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("coupons.view");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/coupons/${id}`);
  }

  await mockDelay(150);
  const coupon = getCouponById(id);
  if (!coupon) {
    return NextResponse.json(
      { success: false, errors: { form: "Coupon not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: coupon });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("coupons.update");
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as AdminCouponInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(300);
    const result = updateCoupon(id, body);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: 422 }
      );
    }
    return NextResponse.json({ success: true, data: result.coupon });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update coupon";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("coupons.update");
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { action?: string };

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/coupons/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);
    if (body.action === "toggle") {
      const coupon = toggleCoupon(id);
      if (!coupon) {
        return NextResponse.json(
          { success: false, errors: { form: "Coupon not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: coupon });
    }

    if (body.action === "reset_usage") {
      const coupon = resetCouponUsage(id);
      if (!coupon) {
        return NextResponse.json(
          { success: false, errors: { form: "Coupon not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: coupon });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update coupon";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("coupons.delete");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/coupons/${id}`, {
      method: "DELETE",
    });
  }

  await mockDelay(250);
  if (!deleteCoupon(id)) {
    return NextResponse.json(
      { success: false, errors: { form: "Coupon not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true });
}
