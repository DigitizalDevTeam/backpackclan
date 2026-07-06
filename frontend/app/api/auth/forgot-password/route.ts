import { NextResponse } from "next/server";
import { mockDelay } from "@/lib/mock/api-client";
import { findUserByEmail } from "@/lib/mock/user-store";
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
      const { res, data } = await laravelFetch("/v1/admin/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return NextResponse.json(data, { status: res.status });
    }

    await mockDelay(600);
    // Simulate reset flow without revealing whether the email exists
    void findUserByEmail(email);

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
