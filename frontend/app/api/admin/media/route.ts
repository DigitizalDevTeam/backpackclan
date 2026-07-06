import { NextResponse } from "next/server";
import { requireAuth, requireEditor } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  createMedia,
  deleteMediaBulk,
  getAllMedia,
} from "@/lib/mock/media-store";
import {
  getMediaTypeFromMime,
  validateMediaFile,
} from "@/lib/media/utils";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyFormToLaravel, proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/media");
  }

  await mockDelay(250);
  return NextResponse.json({ success: true, data: getAllMedia() });
}

export async function POST(request: Request) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const formData = await request.formData();

    if (useLaravelApi()) {
      return proxyFormToLaravel(session!, "/v1/admin/media", formData);
    }

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

    await mockDelay(600);
    const item = createMedia({
      filename: file.name,
      url: dataUrl,
      mimeType: file.type,
      mediaType: getMediaTypeFromMime(file.type),
      size: file.size,
      uploadedBy: session!.user.id,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { error, session } = await requireEditor();
  if (error) return error;

  try {
    const body = await request.json();
    const ids: string[] = body.ids;

    if (!ids?.length) {
      return NextResponse.json(
        { success: false, errors: { form: "No items selected" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/media", {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    }

    await mockDelay(400);
    deleteMediaBulk(ids);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
