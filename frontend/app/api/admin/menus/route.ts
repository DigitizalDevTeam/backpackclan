import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getAllMenus } from "@/lib/mock/menu-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/menus");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllMenus() });
}
