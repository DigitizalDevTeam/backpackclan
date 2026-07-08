import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getPricingOverview } from "@/lib/mock/pricing-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requirePermission("pricing.view");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/pricing");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getPricingOverview() });
}
