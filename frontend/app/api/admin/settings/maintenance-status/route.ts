import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { isMaintenanceMode, getSettings } from "@/lib/mock/settings-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data: { enabled: boolean; message: string };
    }>("/v1/admin/settings/maintenance-status", {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  const settings = getSettings();
  return NextResponse.json({
    success: true,
    data: {
      enabled: isMaintenanceMode(),
      message: settings.maintenance.message,
    },
  });
}
