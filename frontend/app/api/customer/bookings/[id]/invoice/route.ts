import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { buildInvoiceText } from "@/lib/account/downloads";
import { getBookingForCustomer } from "@/lib/mock/booking-store";
import { getCustomerById } from "@/lib/mock/customer-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    const res = await fetch(`${getLaravelApiUrl()}/v1/customer/bookings/${id}/invoice`, {
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${auth.session!.token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, errors: { form: "Invoice not found" } },
        { status: res.status }
      );
    }

    const buffer = await res.arrayBuffer();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] ?? `invoice-${id}.pdf`;
    const contentType = res.headers.get("Content-Type") ?? "application/pdf";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const booking = getBookingForCustomer(id, auth.session!.user.id);
  if (!booking) {
    return NextResponse.json(
      { success: false, errors: { form: "Booking not found" } },
      { status: 404 }
    );
  }

  const customer = getCustomerById(auth.session!.user.id);
  if (!customer) {
    return NextResponse.json(
      { success: false, errors: { form: "Customer not found" } },
      { status: 404 }
    );
  }

  const content = buildInvoiceText(booking, customer);
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.invoiceNumber}.txt"`,
    },
  });
}
