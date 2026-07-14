import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  adminCancelBooking,
  adminUpdateBooking,
  getAdminBookingById,
} from "@/lib/mock/booking-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminBookingUpdateInput } from "@/types/admin-booking";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("bookings.view");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/bookings/${id}`);
  }

  await mockDelay(200);
  const booking = getAdminBookingById(id);
  if (!booking) {
    return NextResponse.json(
      { success: false, errors: { form: "Booking not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: booking });
}

export async function PUT(request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("bookings.update");
  if (error) return error;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as AdminBookingUpdateInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(300);
    const result = adminUpdateBooking(id, body);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }
    return NextResponse.json({ success: true, data: result.booking });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update booking";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("bookings.delete");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/bookings/${id}`, {
      method: "DELETE",
    });
  }

  await mockDelay(300);
  const result = adminCancelBooking(id);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: { form: result.error } },
      { status: result.status }
    );
  }
  return NextResponse.json({ success: true, data: result.booking });
}
