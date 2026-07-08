import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { bulkArchiveTrips, bulkPublishTrips } from "@/lib/mock/admin-trip-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function PATCH(request: Request) {
  const { error, session } = await requirePermission("trips.update");
  if (error) return error;

  try {
    const body = await request.json();
    const action = body.action as string;
    const ids = (body.ids ?? []) as string[];

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/trips/1", {
        method: "PATCH",
        body: JSON.stringify({ action, ids }),
      });
    }

    await mockDelay(300);

    if (action === "bulk_publish") {
      bulkPublishTrips(ids);
      return NextResponse.json({ success: true });
    }
    if (action === "bulk_archive") {
      bulkArchiveTrips(ids);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bulk action failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
