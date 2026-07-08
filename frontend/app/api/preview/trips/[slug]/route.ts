import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getAdminTripBySlug } from "@/lib/mock/admin-trip-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { slug } = await params;

  if (useLaravelApi()) {
    const res = await proxyToLaravel(session!, "/v1/admin/trips");
    const data = await res.json();
    if (data.success) {
      const trip = data.data.find((t: { slug: string }) => t.slug === slug);
      if (!trip) {
        return NextResponse.json(
          { success: false, errors: { form: "Trip not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: trip });
    }
    return res;
  }

  const trip = getAdminTripBySlug(slug);
  if (!trip) {
    return NextResponse.json(
      { success: false, errors: { form: "Trip not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: trip });
}
