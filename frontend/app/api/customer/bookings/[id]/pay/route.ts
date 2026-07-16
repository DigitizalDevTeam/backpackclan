import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { recordBookingPayment } from "@/lib/mock/booking-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";
import type { Booking } from "@/types/booking";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const amount = Number(body.amount);

    if (useLaravelApi()) {
      const allowDemoPay = process.env.ALLOW_DEMO_PAYMENTS === "true";

      if (!allowDemoPay) {
        return NextResponse.json(
          {
            success: false,
            errors: {
              form: "Demo payment is disabled. Configure Stripe or Razorpay in admin settings.",
            },
          },
          { status: 403 }
        );
      }

      const res = await fetch(`${getLaravelApiUrl()}/v1/customer/bookings/${id}/pay`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.session!.token}`,
        },
        body: JSON.stringify({ amount }),
        cache: "no-store",
      });

      const data = (await res.json().catch(() => ({}))) as {
        success: boolean;
        data?: Booking;
        errors?: Record<string, string>;
      };

      if (!res.ok || !data.success) {
        return NextResponse.json(
          { success: false, errors: data.errors ?? { form: "Payment failed" } },
          { status: res.status }
        );
      }

      return NextResponse.json({ success: true, data: data.data });
    }

    const booking = recordBookingPayment(id, auth.session!.user.id, amount);
    if (!booking) {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid payment amount or booking not found" } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: booking });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Payment failed" } },
      { status: 500 }
    );
  }
}
