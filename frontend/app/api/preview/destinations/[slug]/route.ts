import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getDestinationBySlug } from "@/lib/mock/destination-store";
import { getActiveBannersForDestination } from "@/lib/mock/banner-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { slug } = await params;

  if (useLaravelApi()) {
    const destinations = await proxyToLaravel(session!, "/v1/admin/destinations");
    const data = await destinations.json();
    if (data.success) {
      const destination = data.data.find((d: { slug: string }) => d.slug === slug);
      if (!destination) {
        return NextResponse.json(
          { success: false, errors: { form: "Destination not found" } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: destination });
    }
    return destinations;
  }

  const destination = getDestinationBySlug(slug);
  if (!destination) {
    return NextResponse.json(
      { success: false, errors: { form: "Destination not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  const pageBanner = getActiveBannersForDestination(destination.id)[0] ?? null;
  return NextResponse.json({ success: true, data: destination, pageBanner });
}
