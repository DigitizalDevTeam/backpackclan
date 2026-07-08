import { NextResponse } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createCategory, getAllCategories } from "@/lib/mock/category-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { CategoryInput } from "@/types/category";

export async function GET() {
  const { error, session } = await requirePermission("categories.view");
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/categories");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllCategories() });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("categories.create");
  if (error) return error;

  try {
    const body = (await request.json()) as CategoryInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/categories", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const category = createCategory(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create category";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
