import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { mockDelay } from "@/lib/mock/api-client";
import { getPublishedPublicTrips } from "@/lib/mock/admin-trip-store";
import { paginateArray } from "@/lib/site/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (useLaravelApi()) {
    const qs = searchParams.toString();
    const { res, data } = await laravelFetch(`/v1/trips${qs ? `?${qs}` : ""}`);
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(100);
  let trips = getPublishedPublicTrips();
  const destination = searchParams.get("destination");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  if (destination) {
    trips = trips.filter((t) => t.destination === destination);
  }
  if (category) {
    trips = trips.filter((t) => t.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    trips = trips.filter((t) =>
      `${t.title} ${t.destination} ${t.route}`.toLowerCase().includes(q)
    );
  }

  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(48, Math.max(1, Number(searchParams.get("per_page") || 12)));
  const paged = paginateArray(trips, page, perPage);

  return NextResponse.json({
    success: true,
    data: {
      items: paged.items,
      meta: paged.meta,
      facets: {
        destinations: [...new Set(getPublishedPublicTrips().map((t) => t.destination))].sort(),
        categories: [...new Set(getPublishedPublicTrips().map((t) => t.category))].sort(),
      },
    },
  });
}
