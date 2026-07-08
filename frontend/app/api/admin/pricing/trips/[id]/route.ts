import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { updateTripPricing } from "@/lib/mock/pricing-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { TripPricing } from "@/types/travel";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("pricing.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as { pricing: TripPricing };

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/pricing/trips/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const trip = updateTripPricing(id, body.pricing);
    return NextResponse.json({ success: true, data: trip });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update pricing";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
