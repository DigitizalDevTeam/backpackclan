import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteDeparture,
  getDepartureById,
  updateDeparture,
} from "@/lib/mock/departure-store";
import { enrichDeparture } from "@/lib/departures/utils";
import { getAdminTripById } from "@/lib/mock/admin-trip-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { DepartureInput } from "@/types/departure";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("departures.view");
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/departures/${id}`);
  }

  const departure = getDepartureById(id);
  if (!departure) {
    return NextResponse.json(
      { success: false, errors: { form: "Departure not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  const tripTitle = getAdminTripById(departure.tripId)?.title ?? "";
  return NextResponse.json({
    success: true,
    data: enrichDeparture(departure, tripTitle),
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("departures.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as DepartureInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/departures/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const departure = updateDeparture(id, body);
    return NextResponse.json({ success: true, data: departure });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update departure";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("departures.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/departures/${id}`, {
        method: "DELETE",
      });
    }

    await mockDelay(300);
    deleteDeparture(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete departure";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
