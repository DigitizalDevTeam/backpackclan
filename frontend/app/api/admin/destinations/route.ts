import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createDestination, getAllDestinations } from "@/lib/mock/destination-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { DestinationInput } from "@/types/destination";

export async function GET() {
  const { error, session } = await requirePermission("destinations.view");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/destinations");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllDestinations() });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("destinations.create");
  if (error) return error;

  try {
    const body = (await request.json()) as DestinationInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/destinations", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const destination = createDestination(body);
    return NextResponse.json({ success: true, data: destination }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create destination";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
