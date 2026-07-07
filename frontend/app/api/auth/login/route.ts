import { NextResponse } from "next/server";
import {
  buildSessionCookieValue,
  createSessionToken,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import { authenticateUser } from "@/lib/mock/auth";
import { laravelUnifiedLogin, useLaravelApi } from "@/lib/api/auth-laravel";

function setSessionCookie(response: NextResponse, user: Parameters<typeof buildSessionCookieValue>[0], token: string) {
  const cookieValue = buildSessionCookieValue(user, token);
  response.cookies.set(SESSION_COOKIE, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

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
      const result = await laravelUnifiedLogin(email, password);
      if (!result.ok) {
        return NextResponse.json(
          { success: false, errors: result.errors },
          { status: 401 }
        );
      }

      const response = NextResponse.json({ success: true, data: { user: result.user } });
      setSessionCookie(response, result.user, result.token);
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
    const response = NextResponse.json({ success: true, data: { user } });
    setSessionCookie(response, user, token);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, errors: { form: "Something went wrong" } },
      { status: 500 }
    );
  }
}
