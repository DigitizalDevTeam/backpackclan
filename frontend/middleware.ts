import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  parseSessionCookieValue,
  SESSION_COOKIE,
} from "@/lib/auth/session-cookie";

const publicPaths = ["/login", "/forgot-password"];
const authApiPaths = ["/api/auth/login", "/api/auth/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie
    ? parseSessionCookieValue(sessionCookie)
    : null;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  const isAuthApi = authApiPaths.some((path) => pathname.startsWith(path));
  const isAdminPath = pathname.startsWith("/admin");
  const isPreviewPath = pathname.startsWith("/preview");

  if (isAuthApi) {
    return NextResponse.next();
  }

  if (isAdminPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (isPreviewPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/forgot-password",
    "/admin/:path*",
    "/preview/:path*",
    "/api/auth/:path*",
  ],
};
