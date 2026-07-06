import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { createUser, getAllUsers } from "@/lib/mock/user-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function GET() {
  const { error, session } = await requirePermission("users.view");
  if (error) return error;

  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data: unknown;
      errors?: Record<string, string>;
    }>("/v1/admin/users", { token: session!.token });

    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(300);
  return NextResponse.json({ success: true, data: getAllUsers() });
}

export async function POST(request: Request) {
  const { error, session } = await requirePermission("users.create");
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, roleId, isActive, password } = body;

    if (!name || !email || !roleId || !password) {
      return NextResponse.json(
        {
          success: false,
          errors: { form: "Name, email, role, and password are required" },
        },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch("/v1/admin/users", {
        method: "POST",
        token: session!.token,
        body: JSON.stringify({ name, email, roleId, isActive, password }),
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(400);
    const user = createUser({
      name,
      email,
      role: "editor",
      isActive: isActive ?? true,
      password,
    });
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
