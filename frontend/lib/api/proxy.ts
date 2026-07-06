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
  return NextResponse.json(data, { status: res.status });
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
