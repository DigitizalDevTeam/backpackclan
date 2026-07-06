import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteMenuItem,
  getDescendantIds,
  getMenuItemById,
  toggleMenuItemActive,
  updateMenuItem,
} from "@/lib/mock/menu-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { MenuItemInput } from "@/types/menu";

type RouteParams = { params: Promise<{ id: string; itemId: string }> };

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id, itemId } = await params;
    const body = (await request.json()) as Partial<MenuItemInput>;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${id}/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const item = updateMenuItem(itemId, body);
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update item";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id, itemId } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${id}/items/${itemId}`, {
        method: "DELETE",
      });
    }

    const target = getMenuItemById(itemId);
    if (!target) {
      return NextResponse.json(
        { success: false, errors: { form: "Menu item not found" } },
        { status: 404 }
      );
    }

    const childCount = getDescendantIds(itemId, target.menuId).length;
    await mockDelay(400);
    deleteMenuItem(itemId);

    return NextResponse.json({
      success: true,
      data: { deletedChildren: childCount },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id, itemId } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${id}/items/${itemId}`, {
        method: "PATCH",
      });
    }

    await mockDelay(200);
    const item = toggleMenuItemActive(itemId);
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to toggle item";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
