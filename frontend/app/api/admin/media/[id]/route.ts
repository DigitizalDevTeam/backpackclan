import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { deleteMedia, getMediaById, updateMedia } from "@/lib/mock/media-store";
import { validateMediaFile } from "@/lib/media/utils";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyFormToLaravel, proxyToLaravel } from "@/lib/api/proxy";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, `/v1/admin/media/${id}`);
  }

  const item = getMediaById(id);
  if (!item) {
    return NextResponse.json(
      { success: false, errors: { form: "Media not found" } },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: item });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") ?? "";

    if (useLaravelApi()) {
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        return proxyFormToLaravel(session!, `/v1/admin/media/${id}`, formData, "PUT");
      }
      const body = await request.json();
      return proxyToLaravel(session!, `/v1/admin/media/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, errors: { form: "No file provided" } },
          { status: 400 }
        );
      }
      const validationError = validateMediaFile(file);
      if (validationError) {
        return NextResponse.json(
          { success: false, errors: { form: validationError } },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      await mockDelay(500);
      const item = updateMedia(id, { url: dataUrl, filename: file.name });
      return NextResponse.json({ success: true, data: item });
    }

    const body = await request.json();
    await mockDelay(300);
    const item = updateMedia(id, { altText: body.altText, title: body.title });
    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
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
      return proxyToLaravel(session!, `/v1/admin/media/${id}`, { method: "DELETE" });
    }

    await mockDelay(300);
    deleteMedia(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
