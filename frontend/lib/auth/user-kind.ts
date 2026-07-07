import type { AuthUser } from "@/types/auth";

export const CUSTOMER_ROLE = "customer";
const STAFF_ROLES = new Set(["super-admin", "admin", "editor", "viewer"]);

export function isCustomerUser(user: AuthUser): boolean {
  return user.userType === "customer" || user.role === CUSTOMER_ROLE;
}

export function isStaffUser(user: AuthUser): boolean {
  return !isCustomerUser(user) && (STAFF_ROLES.has(user.role) || user.userType === "staff");
}

export function getAuthHomePath(user: AuthUser): string {
  return isCustomerUser(user) ? "/account/dashboard" : "/admin/dashboard";
}
