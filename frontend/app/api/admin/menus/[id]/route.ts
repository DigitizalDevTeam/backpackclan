import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  buildMenuTree,
  flattenMenuTree,
  getMenuById,
  getMenuItems,
} from "@/lib/mock/menu-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/menus/${id}`);
  }

  const menu = getMenuById(id);
  if (!menu) {
    return NextResponse.json(
      { success: false, errors: { form: "Menu not found" } },
      { status: 404 }
    );
  }

  const items = getMenuItems(id);
  const tree = buildMenuTree(items);
  const flat = flattenMenuTree(tree);

  await mockDelay(200);
  return NextResponse.json({
    success: true,
    data: { menu, items, tree, flat },
  });
}
