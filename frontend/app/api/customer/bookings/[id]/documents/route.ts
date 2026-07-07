import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { addBookingDocument } from "@/lib/mock/booking-store";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";
import type { BookingDocument, DocumentCategory } from "@/types/booking";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  const { id } = await context.params;

  try {
    const formData = await request.formData();

    if (useLaravelApi()) {
      const res = await fetch(`${getLaravelApiUrl()}/v1/customer/bookings/${id}/documents`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.session!.token}`,
        },
        body: formData,
        cache: "no-store",
      });

      const data = (await res.json().catch(() => ({}))) as {
        success: boolean;
        data?: BookingDocument;
        errors?: Record<string, string>;
      };

      if (!res.ok || !data.success) {
        return NextResponse.json(
          { success: false, errors: data.errors ?? { form: "Upload failed" } },
          { status: res.status }
        );
      }

      return NextResponse.json({ success: true, data: data.data });
    }

    const file = formData.get("file");
    const category = String(formData.get("category") ?? "other") as DocumentCategory;

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, errors: { form: "Please select a file to upload" } },
        { status: 400 }
      );
    }

    const doc = addBookingDocument(id, auth.session!.user.id, {
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      category,
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, errors: { form: "Booking not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: doc });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Upload failed" } },
      { status: 500 }
    );
  }
}
