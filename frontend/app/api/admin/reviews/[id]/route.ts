import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { moderateAdminReview } from "@/lib/mock/trip-review-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { TripReviewStatus } from "@/types/booking-review";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("bookings.update");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/reviews/${id}`, {
      method: "PATCH",
      body: await request.text(),
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const result = moderateAdminReview(id, body.status as TripReviewStatus);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Could not update review" } },
      { status: 500 }
    );
  }
}
