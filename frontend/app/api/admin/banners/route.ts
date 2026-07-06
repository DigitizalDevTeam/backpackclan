import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createBanner, getAllBanners } from "@/lib/mock/banner-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { BannerInput } from "@/types/banner";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/banners");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllBanners() });
}

export async function POST(request: Request) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const body = (await request.json()) as BannerInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/banners", {
        method: "POST",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const banner = createBanner(body);
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create banner";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
