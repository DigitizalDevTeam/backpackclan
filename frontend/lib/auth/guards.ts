import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { isCustomerUser } from "@/lib/auth/user-kind";

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, errors: { form: "Unauthorized" } },
        { status: 401 }
      ),
    };
  }

  return { session };
}

export async function requirePermission(permission: string) {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, errors: { form: "Unauthorized" } },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(session.user, permission)) {
    return {
      error: NextResponse.json(
        { success: false, errors: { form: "Forbidden" } },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/** @deprecated Use requirePermission with specific permission slugs */
export async function requireAdmin() {
  return requirePermission("users.view");
}

export async function requireEditor() {
  const result = await requireAuth();
  if ("error" in result && result.error) return result;

  const session = result.session!;
  const perms = session.user.permissions ?? [];

  if (perms.length > 0) {
    const canWrite = perms.some(
      (p) =>
        p.endsWith(".create") ||
        p.endsWith(".update") ||
        p.endsWith(".upload") ||
        p.endsWith(".delete")
    );
    if (!canWrite) {
      return {
        error: NextResponse.json(
          {
            success: false,
            errors: { form: "You do not have permission to modify content" },
          },
          { status: 403 }
        ),
      };
    }
    return result;
  }

  // Mock fallback
  if (session.user.role === "viewer") {
    return {
      error: NextResponse.json(
        {
          success: false,
          errors: { form: "You do not have permission to modify content" },
        },
        { status: 403 }
      ),
    };
  }

  return result;
}

export async function requireCustomer() {
  const session = await getSession();

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, errors: { form: "Unauthorized" } },
        { status: 401 }
      ),
    };
  }

  if (session.user.userType !== "customer" && !isCustomerUser(session.user)) {
    return {
      error: NextResponse.json(
        { success: false, errors: { form: "Forbidden" } },
        { status: 403 }
      ),
    };
  }

  return { session };
}
