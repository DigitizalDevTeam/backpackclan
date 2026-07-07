import type { AuthUser } from "@/types/auth";

export const SESSION_COOKIE = "backpackclan_session";

export interface SessionPayload {
  userId: string;
  token: string;
  user?: AuthUser;
  authRealm?: "customer" | "admin";
}

function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSession(value: string): SessionPayload | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.userId || !payload.token) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string): string {
  return `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function buildSessionCookieValue(
  user: AuthUser,
  token: string,
  authRealm?: "customer" | "admin"
): string {
  return encodeSession({
    userId: user.id,
    token,
    user,
    authRealm: authRealm ?? (user.userType === "customer" || user.role === "customer" ? "customer" : "admin"),
  });
}

/** Lightweight parse for middleware — uses cached user from cookie only. */
export function parseSessionCookieValue(value: string): AuthUser | null {
  const payload = decodeSession(value);
  if (!payload?.user) return null;
  return payload.user;
}

export function decodeSessionPayload(value: string): SessionPayload | null {
  return decodeSession(value);
}
