import type { UserRole } from "@/types/auth";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: string | null;
  roleName: string | null;
  permissions?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminUserWithPassword = AdminUser & { password: string };

export type UserFormData = {
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  password?: string;
};
