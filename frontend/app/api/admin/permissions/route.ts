import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getPermissionsList } from "@/lib/mock/role-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function GET() {
  const { error, session } = await requirePermission("roles.view");
  if (error) return error;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch("/v1/admin/permissions", {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(150);
  return NextResponse.json({ success: true, data: getPermissionsList() });
}
