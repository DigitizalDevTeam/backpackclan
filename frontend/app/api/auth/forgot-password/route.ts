import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { issueMockResetToken } from "@/lib/mock/password-reset-store";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body?.email as string | undefined;

    if (!email) {
      return NextResponse.json(
        { success: false, errors: { email: "Email is required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch("/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(600);
    void issueMockResetToken(email);

    return NextResponse.json({
      success: true,
      message: "If that email exists, a reset link has been sent.",
    });
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Something went wrong" } },
      { status: 500 }
    );
  }
}
