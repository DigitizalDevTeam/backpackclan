import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { getBookingsByCustomerId } from "@/lib/mock/booking-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { Booking } from "@/types/booking";

export async function GET() {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data: Booking[];
    }>("/v1/customer/bookings", { token: auth.session!.token });

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, errors: { form: "Failed to load bookings" } },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  }

  const bookings = getBookingsByCustomerId(auth.session!.user.id);
  return NextResponse.json({ success: true, data: bookings });
}
