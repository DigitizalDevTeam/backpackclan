import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  adminCreateBooking,
  getAdminBookings,
} from "@/lib/mock/booking-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { AdminBookingInput } from "@/types/admin-booking";

export async function GET(request: Request) {
  const { error, session } = await requirePermission("bookings.view");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (search) qs.set("search", search);
  const query = qs.toString() ? `?${qs}` : "";

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/bookings${query}`);
  }

  await mockDelay(250);
  let data = getAdminBookings();
  if (status) data = data.filter((b) => b.status === status);
  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (b) =>
        b.bookingRef.toLowerCase().includes(q) ||
        b.tripTitle.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q) ||
        (b.contactEmail ?? "").toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("bookings.create");
  if (error) return error;

  try {
    const body = (await request.json()) as AdminBookingInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/bookings", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const result = adminCreateBooking(body);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }
    return NextResponse.json({ success: true, data: result.booking }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create booking";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
