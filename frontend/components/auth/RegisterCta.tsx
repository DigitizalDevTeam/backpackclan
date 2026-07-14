"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function RegisterCta() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const href = redirect
    ? `/register?redirect=${encodeURIComponent(redirect)}`
    : "/register";

  return (
    <p className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{" "}
      <Link href={href} className="font-medium text-primary hover:underline">
        Create one free
      </Link>
    </p>
  );
}
