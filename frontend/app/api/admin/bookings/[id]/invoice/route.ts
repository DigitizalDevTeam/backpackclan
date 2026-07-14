import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminBookingById } from "@/lib/mock/booking-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";
import { buildInvoiceText } from "@/lib/account/downloads";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("bookings.view");
  if (error) return error;

  const { id } = await context.params;

  if (useLaravelApi()) {
    const res = await fetch(`${getLaravelApiUrl()}/v1/admin/bookings/${id}/invoice`, {
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${session!.token}`,
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
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  const booking = getAdminBookingById(id);
  if (!booking) {
    return NextResponse.json(
      { success: false, errors: { form: "Booking not found" } },
      { status: 404 }
    );
  }
  const content = buildInvoiceText(booking, {
    name: booking.customer?.name ?? "Customer",
    email: booking.customer?.email ?? booking.contactEmail ?? "",
    phone: booking.customer?.phone ?? booking.contactPhone ?? null,
  });
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.invoiceNumber}.txt"`,
    },
  });
}
