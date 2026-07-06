import type { AuthUser } from "@/types/auth";
import {
  authenticateUser as storeAuthenticate,
  getUserById as storeGetUserById,
} from "@/lib/mock/user-store";
import { getRoleBySlug } from "@/lib/mock/role-store";

function enrichUser(user: NonNullable<ReturnType<typeof storeGetUserById>>): AuthUser {
  const role = getRoleBySlug(user.role);
  return {
    ...user,
    roleId: role?.id ?? null,
    roleName: role?.name ?? user.role,
    permissions: role?.permissions ?? [],
  };
}

export function authenticateUser(
  email: string,
  password: string
): AuthUser | null {
  const user = storeAuthenticate(email, password);
  return user ? enrichUser(user) : null;
}

export function getUserById(id: string): AuthUser | null {
  const user = storeGetUserById(id);
  return user ? enrichUser(user) : null;
}
