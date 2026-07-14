import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { getLaravelApiUrl, useLaravelApi } from "@/lib/api/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { error, session } = await requirePermission("leads.view");
  if (error) return error;
  const { id } = await context.params;

  if (!useLaravelApi()) {
    return NextResponse.json(
      { success: false, errors: { form: "Resume download requires API mode" } },
      { status: 404 }
    );
  }

  const res = await fetch(`${getLaravelApiUrl()}/v1/admin/leads/${id}/resume`, {
    headers: {
      Authorization: `Bearer ${session!.token}`,
      Accept: "application/octet-stream",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { success: false, errors: { form: "Resume not found" } },
      { status: res.status }
    );
  }

  const buffer = await res.arrayBuffer();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "resume.pdf";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
