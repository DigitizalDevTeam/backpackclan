export type UserRole = string;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId: string | null;
  roleName: string | null;
  permissions: string[];
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}
