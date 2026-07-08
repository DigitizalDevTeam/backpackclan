import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getCalendarDepartures } from "@/lib/mock/departure-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET(request: Request) {
  const { error, session } = await requirePermission("departures.view");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/departures/calendar?month=${month}`);
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: getCalendarDepartures(month) });
}
