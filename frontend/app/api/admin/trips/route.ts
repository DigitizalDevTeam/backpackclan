import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createAdminTrip, getAllAdminTrips } from "@/lib/mock/admin-trip-store";
import { getDepartureCountByTripId } from "@/lib/mock/departure-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminTripInput } from "@/types/admin-trip";

export async function GET() {
  const { error, session } = await requirePermission("trips.view");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/trips");
  }

  await mockDelay(250);
  const trips = getAllAdminTrips().map((t) => ({
    ...t,
    departuresCount: getDepartureCountByTripId(t.id),
  }));
  return NextResponse.json({ success: true, data: trips });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("trips.create");
  if (error) return error;

  try {
    const body = (await request.json()) as AdminTripInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/trips", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const trip = createAdminTrip(body);
    return NextResponse.json({ success: true, data: trip }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create trip";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
