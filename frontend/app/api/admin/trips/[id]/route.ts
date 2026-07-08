import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  archiveAdminTrip,
  deleteAdminTrip,
  duplicateAdminTrip,
  getAdminTripById,
  publishAdminTrip,
  toggleTripFeatured,
  updateAdminTrip,
} from "@/lib/mock/admin-trip-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminTripInput } from "@/types/admin-trip";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("trips.view");
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/trips/${id}`);
  }

  const trip = getAdminTripById(id);
  if (!trip) {
    return NextResponse.json(
      { success: false, errors: { form: "Trip not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: trip });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("trips.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as AdminTripInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/trips/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const trip = updateAdminTrip(id, body);
    return NextResponse.json({ success: true, data: trip });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update trip";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("trips.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/trips/${id}`, { method: "DELETE" });
    }

    await mockDelay(300);
    deleteAdminTrip(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete trip";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("trips.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/trips/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);

    if (body.action === "duplicate") {
      return NextResponse.json({ success: true, data: duplicateAdminTrip(id) });
    }
    if (body.action === "archive") {
      return NextResponse.json({ success: true, data: archiveAdminTrip(id) });
    }
    if (body.action === "publish") {
      return NextResponse.json({ success: true, data: publishAdminTrip(id) });
    }
    if (body.action === "toggle_featured") {
      return NextResponse.json({ success: true, data: toggleTripFeatured(id) });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update trip";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
