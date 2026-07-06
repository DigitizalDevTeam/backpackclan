import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getAllSeoMeta, getSeoPageDefinition, SEO_PAGES } from "@/lib/mock/seo-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/seo");
  }

  await mockDelay(250);
  const data = getAllSeoMeta().map((meta) => {
    const page = getSeoPageDefinition(meta.pageKey);
    return {
      ...meta,
      label: page?.label ?? meta.pageKey,
      path: page?.path ?? "/",
      isPlaceholder: page?.isPlaceholder ?? false,
    };
  });

  return NextResponse.json({ success: true, data, pages: SEO_PAGES });
}
