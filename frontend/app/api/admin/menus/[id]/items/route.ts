import { NextResponse } from "next/server";
import { requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createMenuItem, getMenuById, reorderSiblings } from "@/lib/mock/menu-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { MenuItemInput } from "@/types/menu";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as MenuItemInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${id}/items`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    if (!getMenuById(id)) {
      return NextResponse.json(
        { success: false, errors: { form: "Menu not found" } },
        { status: 404 }
      );
    }

    await mockDelay(400);
    const item = createMenuItem(id, body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create item";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/menus/${id}/items`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    if (!getMenuById(id)) {
      return NextResponse.json(
        { success: false, errors: { form: "Menu not found" } },
        { status: 404 }
      );
    }

    const { parentId, orderedIds } = body as {
      parentId: string | null;
      orderedIds: string[];
    };

    await mockDelay(300);
    const items = reorderSiblings(id, parentId ?? null, orderedIds);
    return NextResponse.json({ success: true, data: items });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
