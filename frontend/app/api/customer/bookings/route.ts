import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { createBooking, getBookingsByCustomerId } from "@/lib/mock/booking-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { Booking, CreateBookingPayload } from "@/types/booking";

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

export async function POST(request: Request) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  let body: CreateBookingPayload;
  try {
    body = (await request.json()) as CreateBookingPayload;
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid request body" } },
      { status: 400 }
    );
  }

  if (!body.acceptedTerms) {
    return NextResponse.json(
      { success: false, errors: { form: "Please accept the terms to continue" } },
      { status: 422 }
    );
  }

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: Booking;
      errors?: { form?: string };
    }>("/v1/customer/bookings", {
      method: "POST",
      token: auth.session!.token,
      body: JSON.stringify(body),
    });

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        {
          success: false,
          errors: { form: data.errors?.form || "Failed to create booking" },
        },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json({ success: true, data: data.data }, { status: 201 });
  }

  const result = createBooking(auth.session!.user.id, body, {
    phone: auth.session!.user.phone,
    email: auth.session!.user.email,
  });

  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: { form: result.error } },
      { status: result.status }
    );
  }

  return NextResponse.json({ success: true, data: result.booking }, { status: 201 });
}
