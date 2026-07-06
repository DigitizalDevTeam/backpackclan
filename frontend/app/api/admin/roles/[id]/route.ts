import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import {
  deleteRole,
  getRoleById,
  updateRole,
} from "@/lib/mock/role-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("roles.view");
  if (error) return error;
  const { id } = await params;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(`/v1/admin/roles/${id}`, {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(200);
  const role = getRoleById(id);
  if (!role) {
    return NextResponse.json(
      { success: false, errors: { form: "Role not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: role });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("roles.update");
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(`/v1/admin/roles/${id}`, {
      method: "PUT",
      token: session!.token,
      body: JSON.stringify(body),
    });
    return NextResponse.json(data, { status: res.status });
  }

  try {
    await mockDelay(300);
    const role = updateRole(id, body);
    return NextResponse.json({ success: true, data: role });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update role";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("roles.delete");
  if (error) return error;
  const { id } = await params;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(`/v1/admin/roles/${id}`, {
      method: "DELETE",
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  try {
    await mockDelay(300);
    deleteRole(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete role";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
