import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { cancelBookingForCustomer } from "@/lib/mock/booking-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    if (useLaravelApi()) {
      const res = await fetch(
        `${getLaravelApiUrl()}/v1/customer/bookings/${id}/cancel`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${auth.session!.token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }

    const result = cancelBookingForCustomer(id, auth.session!.user.id);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, errors: { form: result.error } },
        { status: result.status }
      );
    }

    return NextResponse.json({ success: true, data: result.booking });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Could not cancel booking" } },
      { status: 500 }
    );
  }
}
