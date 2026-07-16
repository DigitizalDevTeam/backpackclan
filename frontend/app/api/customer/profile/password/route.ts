import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { changeCustomerPassword } from "@/lib/mock/customer-store";
import { proxyToLaravel } from "@/lib/api/proxy";
import { useLaravelApi } from "@/lib/api/backend";

export async function POST(request: Request) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

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
      return proxyToLaravel(auth.session!, "/v1/customer/profile/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    }

    await mockDelay(400);
    changeCustomerPassword(auth.session!.user.id, currentPassword, newPassword);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to change password";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
