import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminReviews } from "@/lib/mock/trip-review-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { TripReviewStatus } from "@/types/booking-review";

export async function GET(request: NextRequest) {
  const { error, session } = await requirePermission("bookings.view");
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status") as TripReviewStatus | null;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;

  if (useLaravelApi()) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    const qs = params.toString();
    return proxyToLaravel(session!, `/v1/admin/reviews${qs ? `?${qs}` : ""}`);
  }

  return NextResponse.json({
    success: true,
    data: listAdminReviews({ status: status ?? undefined, search }),
  });
}
