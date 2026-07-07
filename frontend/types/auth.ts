export type UserRole = string;
export type UserType = "staff" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: string | null;
  roleName: string | null;
  permissions: string[];
  userType: UserType;
  phone?: string | null;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
