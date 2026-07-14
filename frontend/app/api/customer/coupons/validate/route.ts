import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { validateMockCoupon, type CouponValidation } from "@/lib/booking/pricing";

export async function POST(request: Request) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  let body: { code?: string; subtotal?: number; tripSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid request body" } },
      { status: 400 }
    );
  }

  if (!body.code || typeof body.subtotal !== "number") {
    return NextResponse.json(
      { success: false, errors: { form: "code and subtotal are required" } },
      { status: 422 }
    );
  }

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: CouponValidation;
      errors?: { form?: string };
    }>("/v1/customer/coupons/validate", {
      method: "POST",
      token: auth.session!.token,
      body: JSON.stringify({
        code: body.code,
        subtotal: body.subtotal,
        tripSlug: body.tripSlug,
      }),
    });

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        { success: false, errors: { form: data.errors?.form || "Invalid coupon" } },
        { status: res.status >= 400 ? res.status : 422 }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  }

  const result = validateMockCoupon(body.code, body.subtotal, body.tripSlug);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: { form: result.error } },
      { status: 422 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}
