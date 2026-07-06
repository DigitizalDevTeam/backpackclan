import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { deleteUser, getUserById, updateUser } from "@/lib/mock/user-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("users.view");
  if (error) return error;
  const { id } = await params;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch(`/v1/admin/users/${id}`, {
      token: session!.token,
    });
    return NextResponse.json(data, { status: res.status });
  }

  const user = getUserById(id);
  if (!user) {
    return NextResponse.json(
      { success: false, errors: { form: "User not found" } },
      { status: 404 }
    );
  }
  await mockDelay(200);
  return NextResponse.json({ success: true, data: user });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("users.update");
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch(`/v1/admin/users/${id}`, {
        method: "PUT",
        token: session!.token,
        body: JSON.stringify(body),
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(400);
    const user = updateUser(id, {
      name: body.name,
      email: body.email,
      role: "editor",
      isActive: body.isActive,
      password: body.password || undefined,
    });
    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, session } = await requirePermission("users.delete");
  if (error) return error;

  try {
    const { id } = await params;

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch(`/v1/admin/users/${id}`, {
        method: "DELETE",
        token: session!.token,
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(400);
    deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
