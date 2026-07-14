import type { AuthUser } from "@/types/auth";

export function useLaravelApi(): boolean {
  return process.env.USE_LARAVEL_API === "true";
}

export function getLaravelApiUrl(): string {
  return (
    process.env.LARAVEL_API_URL?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000/api"
  );
}

interface LaravelFetchOptions extends RequestInit {
  token?: string;
}

export async function laravelFetch<T = unknown>(
  path: string,
  options: LaravelFetchOptions = {}
): Promise<{ res: Response; data: T }> {
  const { token, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  headers.set("Accept", "application/json");
  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getLaravelApiUrl()}${path}`, {
    ...fetchOptions,
    headers,
    cache: "no-store",
    // Prevent build/runtime hangs when API is down or slow
    signal: fetchOptions.signal ?? AbortSignal.timeout(15_000),
  });

  const data = (await res.json().catch(() => ({}))) as T;
  return { res, data };
}

export function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  const role = String(raw.role ?? "");
  const userType =
    raw.userType === "customer" || role === "customer" ? "customer" : "staff";
  return {
    id: String(raw.id),
    name: String(raw.name),
    email: String(raw.email),
    role,
    roleId: raw.roleId ? String(raw.roleId) : null,
    roleName: raw.roleName ? String(raw.roleName) : null,
    permissions: Array.isArray(raw.permissions)
      ? raw.permissions.map(String)
      : [],
    userType,
    phone: raw.phone ? String(raw.phone) : null,
  };
}
