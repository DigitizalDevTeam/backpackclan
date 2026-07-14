import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getMockPaymentOptions } from "@/lib/mock/payment-store";
import type { PaymentOptions } from "@/types/payment";

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
      data?: PaymentOptions;
      errors?: { form?: string };
    }>(`/v1/customer/bookings/${id}/payment-options`, {
      token: auth.session!.token,
    });

    if (!res.ok || !data.success || !data.data) {
      return NextResponse.json(
        { success: false, errors: { form: data.errors?.form || "Failed to load payment options" } },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  }

  const options = getMockPaymentOptions(id, auth.session!.user.id);
  if (!options) {
    return NextResponse.json(
      { success: false, errors: { form: "Booking not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: options });
}
