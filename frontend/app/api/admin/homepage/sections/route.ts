import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createSection, getAllSections, reorderSections } from "@/lib/mock/homepage-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/homepage/sections");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllSections() });
}

export async function POST(request: Request) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const body = await request.json();
    const { title, slug, type } = body as {
      title?: string;
      slug?: string;
      type?: string;
    };

    if (!title?.trim() || !slug?.trim() || !type?.trim()) {
      return NextResponse.json(
        { success: false, errors: { form: "Title, slug, and type are required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/homepage/sections", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), type: type.trim() }),
      });
    }

    await mockDelay(300);
    const data = createSection({
      title: title.trim(),
      slug: slug.trim(),
      type: type.trim() as import("@/types/homepage").HomepageSectionType,
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create section";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const body = await request.json();
    const { orderedIds } = body as { orderedIds: string[] };

    if (!orderedIds?.length) {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid order data" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/homepage/sections", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
    }

    await mockDelay(300);
    const data = reorderSections(orderedIds);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to reorder";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
