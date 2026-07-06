import { cookies } from "next/headers";
import type { AuthSession, AuthUser } from "@/types/auth";
import { getUserById } from "@/lib/mock/auth";
import {
  laravelFetch,
  normalizeAuthUser,
  useLaravelApi,
} from "@/lib/api/backend";
import {
  SESSION_COOKIE,
  buildSessionCookieValue,
  createSessionToken,
  decodeSessionPayload,
} from "@/lib/auth/session-cookie";

export {
  SESSION_COOKIE,
  buildSessionCookieValue,
  createSessionToken,
  parseSessionCookieValue,
} from "@/lib/auth/session-cookie";

async function resolveUser(
  payload: NonNullable<ReturnType<typeof decodeSessionPayload>>
): Promise<AuthUser | null> {
  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data: Record<string, unknown>;
    }>("/v1/admin/me", { token: payload.token });

    if (!res.ok || !data.success) return null;
    return normalizeAuthUser(data.data);
  }

  return getUserById(payload.userId);
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = decodeSessionPayload(raw);
  if (!payload) return null;

  const user = await resolveUser(payload);
  if (!user) return null;

  return { user, token: payload.token };
}

export { useLaravelApi, getLaravelApiUrl } from "@/lib/api/backend";
