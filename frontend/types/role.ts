export interface Permission {
  id: string;
  name: string;
  slug: string;
  group: string;
  description: string | null;
}

export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type RoleFormData = {
  name: string;
  slug: string;
  description: string;
  permissions: string[];
};
