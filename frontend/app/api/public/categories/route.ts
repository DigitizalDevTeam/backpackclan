import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { mockDelay } from "@/lib/mock/api-client";
import { getActiveCategories } from "@/lib/mock/category-store";

export async function GET() {
  if (useLaravelApi()) {
    const { res, data } = await laravelFetch("/v1/categories");
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(100);
  return NextResponse.json({
    success: true,
    data: getActiveCategories(),
  });
}
