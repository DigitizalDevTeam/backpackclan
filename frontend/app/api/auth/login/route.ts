import { NextResponse } from "next/server";
import {
  buildSessionCookieValue,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { authenticateUser } from "@/lib/mock/auth";
import {
  laravelFetch,
  normalizeAuthUser,
  useLaravelApi,
} from "@/lib/api/backend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, errors: { form: "Email and password are required" } },
        { status: 400 }
      );
    }

    if (useLaravelApi()) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data?: { user: Record<string, unknown>; token: string };
        errors?: Record<string, string>;
      }>("/v1/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok || !data.success || !data.data) {
        return NextResponse.json(
          {
            success: false,
            errors: data.errors ?? { form: "Invalid email or password" },
          },
          { status: res.status === 401 ? 401 : 400 }
        );
      }

      const user = normalizeAuthUser(data.data.user);
      const cookieValue = buildSessionCookieValue(user, data.data.token);

      const response = NextResponse.json({ success: true, data: { user } });
      response.cookies.set(SESSION_COOKIE, cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    const user = authenticateUser(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, errors: { form: "Invalid email or password" } },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.id);
    const cookieValue = buildSessionCookieValue(user, token);

    const response = NextResponse.json({ success: true, data: { user } });
    response.cookies.set(SESSION_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Something went wrong" } },
      { status: 500 }
    );
  }
}
