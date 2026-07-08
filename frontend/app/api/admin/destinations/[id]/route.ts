import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  archiveDestination,
  deleteDestination,
  duplicateDestination,
  getDestinationById,
  toggleDestinationFeatured,
  updateDestination,
} from "@/lib/mock/destination-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { DestinationInput } from "@/types/destination";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("destinations.view");
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/destinations/${id}`);
  }

  const destination = getDestinationById(id);
  if (!destination) {
    return NextResponse.json(
      { success: false, errors: { form: "Destination not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: destination });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("destinations.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as DestinationInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/destinations/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const destination = updateDestination(id, body);
    return NextResponse.json({ success: true, data: destination });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update destination";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("destinations.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/destinations/${id}`, {
        method: "DELETE",
      });
    }

    await mockDelay(300);
    deleteDestination(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete destination";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("destinations.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/destinations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);

    if (body.action === "duplicate") {
      const destination = duplicateDestination(id);
      return NextResponse.json({ success: true, data: destination });
    }

    if (body.action === "archive") {
      const destination = archiveDestination(id);
      return NextResponse.json({ success: true, data: destination });
    }

    if (body.action === "toggle_featured") {
      const destination = toggleDestinationFeatured(id);
      return NextResponse.json({ success: true, data: destination });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update destination";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
