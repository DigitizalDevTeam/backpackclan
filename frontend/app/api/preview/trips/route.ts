import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  getPublishedAdminTrips,
  getPublishedPublicTrips,
} from "@/lib/mock/admin-trip-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    const res = await proxyToLaravel(session!, "/v1/admin/trips");
    const data = await res.json();
    if (data.success) {
      const published = (data.data as { status: string }[]).filter(
        (t) => t.status === "published"
      );
      return NextResponse.json({ success: true, data: published });
    }
    return res;
  }

  await mockDelay(200);
  // Return admin trip shape for richer preview listing cards
  const trips = getPublishedAdminTrips();
  // Attach public price fields for card display
  const publicMap = new Map(getPublishedPublicTrips().map((t) => [t.id, t]));
  const data = trips.map((trip) => {
    const pub = publicMap.get(trip.id);
    return {
      ...trip,
      publicPrice: pub?.price ?? trip.pricing.basePrice,
      originalPrice: pub?.originalPrice,
      destinationName: pub?.destination ?? "",
      categoryName: pub?.category ?? "",
    };
  });

  return NextResponse.json({ success: true, data });
}
