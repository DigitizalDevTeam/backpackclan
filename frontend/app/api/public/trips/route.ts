import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { getAllTrips } from "@/lib/mock/trip-store";

export async function GET() {
  await mockDelay(100);
  return NextResponse.json({ success: true, data: getAllTrips() });
}
