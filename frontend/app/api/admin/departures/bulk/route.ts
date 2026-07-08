import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  createBulkDepartures,
  previewBulkDepartures,
} from "@/lib/mock/departure-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { BulkDepartureRequest } from "@/types/departure";

export async function POST(request: Request) {
  const { error, session } = await requirePermission("departures.create");
  if (error) return error;

  try {
    const body = await request.json();

    if (body.preview) {
      const preview = previewBulkDepartures(body as BulkDepartureRequest);
      return NextResponse.json({ success: true, data: preview });
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/departures/bulk", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(500);
    const created = createBulkDepartures(body as BulkDepartureRequest);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bulk create failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
