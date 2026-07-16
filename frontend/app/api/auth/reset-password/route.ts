import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { resetMockPassword } from "@/lib/mock/password-reset-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, token, password } = body as {
      email?: string;
      token?: string;
      password?: string;
    };

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, errors: { form: "Email, token, and password are required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch("/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, token, password, password_confirmation: password }),
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(500);
    const ok = resetMockPassword(email, token, password);
    if (!ok) {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid or expired reset link" } },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated. You can sign in with your new password.",
    });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Something went wrong" } },
      { status: 500 }
    );
  }
}
