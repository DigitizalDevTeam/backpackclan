import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteBanner,
  duplicateBanner,
  getBannerById,
  toggleBannerActive,
  updateBanner,
} from "@/lib/mock/banner-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { BannerInput } from "@/types/banner";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/banners/${id}`);
  }

  const banner = getBannerById(id);
  if (!banner) {
    return NextResponse.json(
      { success: false, errors: { form: "Banner not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: banner });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id } = await params;
    const body = (await request.json()) as BannerInput;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/banners/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const banner = updateBanner(id, body);
    return NextResponse.json({ success: true, data: banner });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update banner";
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
    const { id } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/banners/${id}`, { method: "DELETE" });
    }

    await mockDelay(300);
    deleteBanner(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete banner";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/banners/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(200);

    if (body.action === "duplicate") {
      const banner = duplicateBanner(id);
      return NextResponse.json({ success: true, data: banner });
    }

    if (body.action === "toggle") {
      const banner = toggleBannerActive(id);
      return NextResponse.json({ success: true, data: banner });
    }

    return NextResponse.json(
      { success: false, errors: { form: "Invalid action" } },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update banner";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
