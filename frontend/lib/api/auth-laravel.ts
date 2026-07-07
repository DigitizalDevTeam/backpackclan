import type { AuthUser } from "@/types/auth";
import { isCustomerUser } from "@/lib/auth/user-kind";
import {
  laravelFetch,
  normalizeAuthUser,
  useLaravelApi,
} from "@/lib/api/backend";

export type AuthRealm = "customer" | "admin";

interface LaravelAuthResponse {
  success: boolean;
  data?: { user: Record<string, unknown>; token: string };
  errors?: Record<string, string>;
}

export function getMePathForUser(user: AuthUser): string {
  return isCustomerUser(user) ? "/v1/customer/me" : "/v1/admin/me";
}

export function getLogoutPathForUser(user: AuthUser): string {
  return isCustomerUser(user) ? "/v1/customer/logout" : "/v1/admin/logout";
}

export function getAuthRealm(user: AuthUser): AuthRealm {
  return isCustomerUser(user) ? "customer" : "admin";
}

export async function laravelCustomerLogin(
  email: string,
  password: string
): Promise<{ ok: false } | { ok: true; user: AuthUser; token: string }> {
  const { res, data } = await laravelFetch<LaravelAuthResponse>("/v1/customer/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok || !data.success || !data.data) {
    return { ok: false };
  }

  return {
    ok: true,
    user: normalizeAuthUser(data.data.user),
    token: data.data.token,
  };
}

export async function laravelAdminLogin(
  email: string,
  password: string
): Promise<{ ok: false; status: number; errors?: Record<string, string> } | { ok: true; user: AuthUser; token: string }> {
  const { res, data } = await laravelFetch<LaravelAuthResponse>("/v1/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok || !data.success || !data.data) {
    return { ok: false, status: res.status, errors: data.errors };
  }

  return {
    ok: true,
    user: normalizeAuthUser(data.data.user),
    token: data.data.token,
  };
}

export async function laravelUnifiedLogin(
  email: string,
  password: string
): Promise<{ ok: false; errors: Record<string, string> } | { ok: true; user: AuthUser; token: string }> {
  const customerAttempt = await laravelCustomerLogin(email, password);
  if (customerAttempt.ok) {
    return customerAttempt;
  }

  const adminAttempt = await laravelAdminLogin(email, password);
  if (adminAttempt.ok) {
    return adminAttempt;
  }

  return {
    ok: false,
    errors: adminAttempt.errors ?? { form: "Invalid email or password" },
  };
}

export async function laravelCustomerRegister(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ ok: false; errors: Record<string, string> } | { ok: true; user: AuthUser; token: string }> {
  const { res, data } = await laravelFetch<LaravelAuthResponse>("/v1/customer/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  if (!res.ok || !data.success || !data.data) {
    return {
      ok: false,
      errors: data.errors ?? { form: "Registration failed" },
    };
  }

  return {
    ok: true,
    user: normalizeAuthUser(data.data.user),
    token: data.data.token,
  };
}

export { useLaravelApi };
