import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteCategory,
  getCategoryById,
  toggleCategoryActive,
  updateCategory,
} from "@/lib/mock/category-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { CategoryInput } from "@/types/category";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("categories.view");
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/categories/${id}`);
  }

  const category = getCategoryById(id);
  if (!category) {
    return NextResponse.json(
      { success: false, errors: { form: "Category not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: category });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("categories.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as CategoryInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const category = updateCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("categories.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/categories/${id}`, {
        method: "DELETE",
      });
    }

    await mockDelay(300);
    deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete category";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("categories.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);

    if (body.action === "toggle") {
      const category = toggleCategoryActive(id);
      return NextResponse.json({ success: true, data: category });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update category";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
