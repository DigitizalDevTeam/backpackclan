import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  createRole,
  getAllRoles,
} from "@/lib/mock/role-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function GET() {
  const { error, session } = await requirePermission("roles.view");
  if (error) return error;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch("/v1/admin/roles", {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(200);
  return NextResponse.json({ success: true, data: getAllRoles() });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("roles.create");
  if (error) return error;

  const body = await request.json();

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch("/v1/admin/roles", {
      method: "POST",
      token: session!.token,
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: res.status });
  }

  try {
    await mockDelay(300);
    const role = createRole(body);
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create role";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
