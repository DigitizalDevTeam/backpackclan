import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { syncDestinationMenuChildren } from "@/lib/mock/menu-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("menus.update");
  if (error) return error;

  try {
    const { id: menuId } = await params;
    const body = await request.json();

    if (body.action !== "sync_destinations") {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid action" } },
        { status: 400 }
      );
    }

    if (!body.parentItemId) {
      return NextResponse.json(
        { success: false, errors: { form: "parentItemId is required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${menuId}/sync-destinations`, {
        method: "POST",
        body: JSON.stringify({ parentItemId: body.parentItemId }),
      });
    }

    await mockDelay(300);
    const items = syncDestinationMenuChildren(menuId, body.parentItemId);
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
