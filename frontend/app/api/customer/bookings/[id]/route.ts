import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { getBookingForCustomer } from "@/lib/mock/booking-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { Booking } from "@/types/booking";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data: Booking;
      errors?: Record<string, string>;
    }>(`/v1/customer/bookings/${id}`, { token: auth.session!.token });

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, errors: data.errors ?? { form: "Booking not found" } },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  }

  const booking = getBookingForCustomer(id, auth.session!.user.id);
  if (!booking) {
    return NextResponse.json(
      { success: false, errors: { form: "Booking not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: booking });
}
