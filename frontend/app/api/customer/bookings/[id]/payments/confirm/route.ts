import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { confirmMockPayment } from "@/lib/mock/payment-store";
import type { Booking } from "@/types/booking";
import type { BookingPayment, PaymentProvider } from "@/types/payment";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  let body: {
    provider?: PaymentProvider;
    paymentIntentId?: string;
    orderId?: string;
    paymentId?: string;
    signature?: string;
    cashfree_order_id?: string;
    mockAmount?: number;
    mock?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid request body" } },
      { status: 400 }
    );
  }

  if (useLaravelApi() && !body.mock) {
    const payload: Record<string, string> = {};
    if (body.provider) payload.provider = body.provider;
    if (body.paymentIntentId) payload.paymentIntentId = body.paymentIntentId;
    if (body.orderId) payload.orderId = body.orderId;
    if (body.paymentId) payload.paymentId = body.paymentId;
    if (body.signature) payload.signature = body.signature;
    if (body.cashfree_order_id) payload.cashfree_order_id = body.cashfree_order_id;

    if (
      !payload.paymentIntentId &&
      !payload.orderId &&
      !payload.cashfree_order_id
    ) {
      return NextResponse.json(
        { success: false, errors: { form: "Payment confirmation details are required" } },
        { status: 422 }
      );
    }

    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: { payment: BookingPayment; booking: Booking };
      errors?: { form?: string };
    }>(`/v1/customer/bookings/${id}/payments/confirm`, {
      method: "POST",
      token: auth.session!.token,
      body: JSON.stringify(payload),
    });

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        {
          success: false,
          errors: { form: data.errors?.form || "Could not confirm payment" },
        },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  }

  const amount = Number(body.mockAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid mock payment amount" } },
      { status: 422 }
    );
  }

  const result = confirmMockPayment(id, auth.session!.user.id, amount);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: { form: result.error } },
      { status: result.status }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      booking: result.booking,
      payment: {
        id: `pay${Date.now()}`,
        bookingId: id,
        amount,
        currency: "inr",
        status: "succeeded" as const,
        provider: "mock",
        mode: "balance" as const,
        paidAt: new Date().toISOString(),
      },
    },
  });
}
