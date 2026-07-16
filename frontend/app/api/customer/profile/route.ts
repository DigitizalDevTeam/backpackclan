import { NextResponse } from "next/server";
import { requireCustomer } from "@/lib/auth/guards";
import {
  buildSessionCookieValue,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { mockDelay } from "@/lib/mock/api-client";
import { customerToAuthUser } from "@/lib/mock/auth";
import { updateCustomerProfile } from "@/lib/mock/customer-store";
import { laravelFetch, normalizeAuthUser, useLaravelApi } from "@/lib/api/backend";

export async function PUT(request: Request) {
  const auth = await requireCustomer();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { name, phone } = body as { name?: string; phone?: string };

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, errors: { form: "Name and phone are required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data: Record<string, unknown>;
        errors?: Record<string, string>;
      }>("/v1/customer/profile", {
        method: "PUT",
        token: auth.session!.token,
        body: JSON.stringify({ name, phone }),
      });

      if (!res.ok || !data.success) {
        return NextResponse.json(
          { success: false, errors: data.errors ?? { form: "Update failed" } },
          { status: res.status }
        );
      }

      const user = normalizeAuthUser(data.data);
      const response = NextResponse.json({ success: true, data: { user } });
      response.cookies.set(
        SESSION_COOKIE,
        buildSessionCookieValue(user, auth.session!.token),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        }
      );
      return response;
    }

    await mockDelay(300);
    const customer = updateCustomerProfile(auth.session!.user.id, { name, phone });
    const user = customerToAuthUser(customer);
    const response = NextResponse.json({ success: true, data: { user } });
    response.cookies.set(
      SESSION_COOKIE,
      buildSessionCookieValue(user, auth.session!.token),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      }
    );
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json(
      { success: false, errors: { form: message } },
      { status: 400 }
    );
  }
}
