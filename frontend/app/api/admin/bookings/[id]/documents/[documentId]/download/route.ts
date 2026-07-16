import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";

interface RouteContext {
  params: Promise<{ id: string; documentId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission("bookings.view");
  if (auth.error) return auth.error;

  const { id, documentId } = await context.params;

  if (!useLaravelApi()) {
    return NextResponse.json(
      { success: false, errors: { form: "Document download requires Laravel API mode" } },
      { status: 501 }
    );
  }

  try {
    const res = await fetch(
      `${getLaravelApiUrl()}/v1/admin/bookings/${id}/documents/${documentId}/download`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${auth.session!.token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          errors: (data as { errors?: Record<string, string> }).errors ?? {
            form: "Download failed",
          },
        },
        { status: res.status }
      );
    }

    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match?.[1] ?? "document";

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Download failed" } },
      { status: 500 }
    );
  }
}
