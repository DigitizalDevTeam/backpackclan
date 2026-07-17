import { NextResponse } from "next/server";
import type { AuthSession } from "@/types/auth";
import { getLaravelApiUrl, laravelFetch } from "@/lib/api/backend";

export async function proxyToLaravel(
  session: AuthSession,
  path: string,
  init?: RequestInit
) {
  const { res, data } = await laravelFetch(path, {
    ...init,
    token: session.token,
  });

  const payload =
    typeof data === "object" && data !== null
      ? (data as Record<string, unknown>)
      : { data };

  if (
    !res.ok &&
    payload.errors &&
    typeof payload.errors === "object" &&
    !("form" in (payload.errors as object))
  ) {
    const fieldErrors = payload.errors as Record<string, unknown>;
    for (const value of Object.values(fieldErrors)) {
      if (typeof value === "string") {
        payload.success = false;
        payload.errors = { ...fieldErrors, form: value };
        break;
      }
      if (Array.isArray(value) && typeof value[0] === "string") {
        payload.success = false;
        payload.errors = { ...fieldErrors, form: value[0] };
        break;
      }
    }
  }

  if (!res.ok && payload.success === undefined) {
    payload.success = false;
  }

  return NextResponse.json(payload, { status: res.status });
}

export async function proxyFormToLaravel(
  session: AuthSession,
  path: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST"
) {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${session.token}`);

  const res = await fetch(`${getLaravelApiUrl()}${path}`, {
    method,
    headers,
    body: formData,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
