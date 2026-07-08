import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getPublishedDestinations } from "@/lib/mock/destination-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    const res = await proxyToLaravel(session!, "/v1/admin/destinations");
    const data = await res.json();
    if (data.success) {
      const published = (data.data as { status: string }[]).filter(
        (d) => d.status === "published"
      );
      return NextResponse.json({ success: true, data: published });
    }
    return res;
  }

  await mockDelay(200);
  return NextResponse.json({
    success: true,
    data: getPublishedDestinations(),
  });
}
