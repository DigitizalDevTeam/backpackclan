import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { getPublishedPublicTrips } from "@/lib/mock/admin-trip-store";

export async function GET() {
  await mockDelay(100);
  return NextResponse.json({ success: true, data: getPublishedPublicTrips() });
}
