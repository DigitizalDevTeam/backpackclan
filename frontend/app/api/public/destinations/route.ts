import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { mockDelay } from "@/lib/mock/api-client";
import { getPublishedDestinations } from "@/lib/mock/destination-store";

export async function GET(request: Request) {
  if (useLaravelApi()) {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const { res, data } = await laravelFetch(
      `/v1/destinations${qs ? `?${qs}` : ""}`
    );
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(100);
  return NextResponse.json({
    success: true,
    data: getPublishedDestinations(),
  });
}
