import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  getSeoByPageKey,
  getSeoPageDefinition,
  resetSeoMeta,
  updateSeoMeta,
} from "@/lib/mock/seo-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";
import type { RobotsDirective } from "@/types/seo";

type RouteParams = { params: Promise<{ pageKey: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { pageKey } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/seo/${pageKey}`);
  }

  const meta = getSeoByPageKey(pageKey);
  const page = getSeoPageDefinition(pageKey);

  if (!meta || !page) {
    return NextResponse.json(
      { success: false, errors: { form: "Page not found" } },
      { status: 404 }
    );
  }

  await mockDelay(200);
  return NextResponse.json({
    success: true,
    data: { ...meta, label: page.label, path: page.path, isPlaceholder: page.isPlaceholder },
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { pageKey } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/seo/${pageKey}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    await mockDelay(400);
    const updated = updateSeoMeta(pageKey, {
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      ogImageId: body.ogImageId ?? null,
      canonicalUrl: body.canonicalUrl,
      robots: body.robots as RobotsDirective,
      schemaJson: body.schemaJson ?? "",
    });

    const page = getSeoPageDefinition(pageKey);
    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        label: page?.label,
        path: page?.path,
        isPlaceholder: page?.isPlaceholder,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update SEO";
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
    const { pageKey } = await params;

    if (useLaravelApi()) {
      return proxyToLaravel(session!, `/v1/admin/seo/${pageKey}`, { method: "DELETE" });
    }

    await mockDelay(400);
    const reset = resetSeoMeta(pageKey);
    const page = getSeoPageDefinition(pageKey);

    return NextResponse.json({
      success: true,
      data: {
        ...reset,
        label: page?.label,
        path: page?.path,
        isPlaceholder: page?.isPlaceholder,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reset SEO";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
