import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { changePassword } from "@/lib/mock/user-store";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function POST(request: Request) {
  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          errors: { form: "Current and new password are required" },
        },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      return proxyToLaravel(session!, "/v1/admin/profile/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }

    await mockDelay(400);
    changePassword(session!.user.id, currentPassword, newPassword);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to change password";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
