import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { createMockPaymentIntent } from "@/lib/mock/payment-store";
import type { PaymentIntentResponse, PaymentMode, PaymentProvider } from "@/types/payment";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;
  let body: { mode?: PaymentMode; provider?: PaymentProvider };
  try {
    body = (await request.json()) as { mode?: PaymentMode; provider?: PaymentProvider };
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid request body" } },
      { status: 400 }
    );
  }

  const mode = body.mode ?? "balance";
  const provider = body.provider;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: PaymentIntentResponse;
      errors?: { form?: string };
    }>(`/v1/customer/bookings/${id}/payments/intent`, {
      method: "POST",
      token: auth.session!.token,
      body: JSON.stringify({ mode, provider }),
    });

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        {
          success: false,
          errors: { form: data.errors?.form || "Could not start payment" },
        },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    return NextResponse.json({ success: true, data: data.data }, { status: 201 });
  }

  const result = createMockPaymentIntent(id, auth.session!.user.id, mode);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, errors: { form: result.error } },
      { status: result.status }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        clientSecret: null,
        publishableKey: null,
        payment: result.payment,
        booking: result.booking,
        mock: true,
      } satisfies PaymentIntentResponse,
    },
    { status: 201 }
  );
}
