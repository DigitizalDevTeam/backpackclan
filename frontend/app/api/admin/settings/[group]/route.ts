import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getSettings, updateSettingsGroup } from "@/lib/mock/settings-store";
import {
  brandingSettingsSchema,
  footerSettingsSchema,
  generalSettingsSchema,
  integrationSettingsSchema,
  maintenanceSettingsSchema,
  socialSettingsSchema,
} from "@/lib/validations/settings";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { SettingsGroup, SiteSettings } from "@/types/settings";

type RouteParams = { params: Promise<{ group: string }> };

const schemas: Record<SettingsGroup, z.ZodType> = {
  general: generalSettingsSchema,
  social: socialSettingsSchema,
  branding: brandingSettingsSchema,
  footer: footerSettingsSchema,
  integrations: integrationSettingsSchema,
  maintenance: maintenanceSettingsSchema,
};

const validGroups: SettingsGroup[] = [
  "general",
  "social",
  "branding",
  "footer",
  "integrations",
  "maintenance",
];

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("settings.view");
  if (error) return error;

  const { group } = await params;
  if (!validGroups.includes(group as SettingsGroup)) {
    return NextResponse.json(
      { success: false, errors: { form: "Invalid settings group" } },
      { status: 400 }
    );
  }

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(`/v1/admin/settings/${group}`, {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  const data = getSettings();
  return NextResponse.json({
    success: true,
    data: data[group as SettingsGroup],
  });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("settings.update");
  if (error) return error;

  try {
    const { group } = await params;
    if (!validGroups.includes(group as SettingsGroup)) {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid settings group" } },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch(`/v1/admin/settings/${group}`, {
        method: "PUT",
        token: session!.token,
        body: JSON.stringify(body),
      });
      return NextResponse.json(data, { status: res.status });
    }

    const schema = schemas[group as SettingsGroup];
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        errors[key] = issue.message;
      });
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const data = parsed.data as SiteSettings[SettingsGroup];

    if (
      group === "maintenance" &&
      (data as SiteSettings["maintenance"]).enabled &&
      !(data as SiteSettings["maintenance"]).message
    ) {
      return NextResponse.json(
        { success: false, errors: { message: "Maintenance message is required" } },
        { status: 400 }
      );
    }

    await mockDelay(400);
    updateSettingsGroup(group as SettingsGroup, data);

    return NextResponse.json({ success: true, data: getSettings() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
