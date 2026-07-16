import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { getBookingReviewMeta } from "@/lib/mock/trip-review-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    if (useLaravelApi()) {
      const res = await fetch(
        `${getLaravelApiUrl()}/v1/customer/bookings/${id}/review`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth.session!.token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const result = getBookingReviewMeta(id, auth.session!.user.id);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Could not load review status" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await request.json();

    if (useLaravelApi()) {
      const res = await fetch(
        `${getLaravelApiUrl()}/v1/customer/bookings/${id}/review`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.session!.token}`,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        }
      );

      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const { submitBookingReview } = await import("@/lib/mock/trip-review-store");
    const result = submitBookingReview(
      id,
      auth.session!.user.id,
      Number(body.rating),
      String(body.text ?? "")
    );

    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Could not submit review" } },
      { status: 500 }
    );
  }
}
