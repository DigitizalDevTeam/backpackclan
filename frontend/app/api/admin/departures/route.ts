import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  createDeparture,
  getDeparturesEnriched,
} from "@/lib/mock/departure-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { DepartureInput } from "@/types/departure";

export async function GET(request: Request) {
  const { error, session } = await requirePermission("departures.view");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const trip = searchParams.get("trip") ?? "";
  const query = trip ? `?trip=${trip}` : "";

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/departures${query}`);
  }

  await mockDelay(250);
  let data = getDeparturesEnriched();
  if (trip) data = data.filter((d) => d.tripId === trip);
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("departures.create");
  if (error) return error;

  try {
    const body = (await request.json()) as DepartureInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/departures", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const departure = createDeparture(body);
    return NextResponse.json({ success: true, data: departure }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create departure";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
