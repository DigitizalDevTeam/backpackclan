import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  getSectionBySlug,
  toggleSectionEnabled,
  updateSectionContent,
} from "@/lib/mock/homepage-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { HomepageSectionContent } from "@/types/homepage";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { slug } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/homepage/sections/${slug}`);
  }

  const section = getSectionBySlug(slug);
  if (!section) {
    return NextResponse.json(
      { success: false, errors: { form: "Section not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: section });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { slug } = await params;
    const body = await request.json();
    const content = body.content as HomepageSectionContent;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/homepage/sections/${slug}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
    }

    await mockDelay(400);
    const section = updateSectionContent(slug, content);
    return NextResponse.json({ success: true, data: section });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update section";
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
    const { slug } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/homepage/sections/${slug}`, {
        method: "PATCH",
      });
    }

    await mockDelay(200);
    const section = toggleSectionEnabled(slug);
    return NextResponse.json({ success: true, data: section });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to toggle section";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
