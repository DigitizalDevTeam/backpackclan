import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth/session";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";

export async function POST() {
  if (useLaravelApi()) {
    const session = await getSession();
    if (session?.token) {
      await laravelFetch("/v1/admin/logout", {
        method: "POST",
        token: session.token,
      });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
