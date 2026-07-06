import type { AdminRole } from "@/types/role";
import { createPersistedStore } from "@/lib/mock/persisted-store";
import {
  getAllPermissionSlugs,
  getPermissionGroups,
  ROLE_PERMISSION_PRESETS,
} from "@/lib/mock/permissions-data";

const SEED_ROLES: AdminRole[] = [
  {
    id: "1",
    name: "Super Administrator",
    slug: "super-admin",
    description: "Full system access including role management",
    isSystem: true,
    permissions: ROLE_PERMISSION_PRESETS["super-admin"],
    userCount: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Administrator",
    slug: "admin",
    description: "Manage users, content, and site settings",
    isSystem: true,
    permissions: ROLE_PERMISSION_PRESETS.admin,
    userCount: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Editor",
    slug: "editor",
    description: "Create and edit CMS content",
    isSystem: true,
    permissions: ROLE_PERMISSION_PRESETS.editor,
    userCount: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Viewer",
    slug: "viewer",
    description: "Read-only access to CMS modules",
    isSystem: true,
    permissions: ROLE_PERMISSION_PRESETS.viewer,
    userCount: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const roleStore = createPersistedStore("roles", SEED_ROLES);

function getRoles(): AdminRole[] {
  return roleStore.get();
}

function persist(): void {
  roleStore.set(roleStore.get());
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getAllRoles(): AdminRole[] {
  return getRoles().map((r) => ({ ...r }));
}

export function getRoleById(id: string): AdminRole | null {
  const role = getRoles().find((r) => r.id === id);
  return role ? { ...role } : null;
}

export function getRoleBySlug(slug: string): AdminRole | null {
  const role = getRoles().find((r) => r.slug === slug);
  return role ? { ...role } : null;
}

export function getPermissionsList() {
  return getPermissionGroups();
}

export function createRole(data: {
  name: string;
  slug?: string;
  description?: string;
  permissions: string[];
}): AdminRole {
  const slug = data.slug || slugify(data.name);
  if (getRoles().some((r) => r.slug === slug)) {
    throw new Error("A role with this slug already exists");
  }

  const valid = new Set(getAllPermissionSlugs());
  const permissions = data.permissions.filter((p) => valid.has(p));
  if (permissions.length === 0) {
    throw new Error("At least one valid permission is required");
  }

  const now = new Date().toISOString();
  const role: AdminRole = {
    id: String(Date.now()),
    name: data.name,
    slug,
    description: data.description ?? null,
    isSystem: false,
    permissions,
    userCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  roleStore.set([...getRoles(), role]);
  return { ...role };
}

export function updateRole(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    permissions?: string[];
  }
): AdminRole {
  const list = getRoles();
  const index = list.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Role not found");

  const existing = list[index];
  if (existing.isSystem && data.slug && data.slug !== existing.slug) {
    throw new Error("System role slug cannot be changed");
  }

  if (data.slug && data.slug !== existing.slug) {
    if (list.some((r) => r.id !== id && r.slug === data.slug)) {
      throw new Error("A role with this slug already exists");
    }
  }

  const valid = new Set(getAllPermissionSlugs());
  const permissions = data.permissions
    ? data.permissions.filter((p) => valid.has(p))
    : existing.permissions;

  if (permissions.length === 0) {
    throw new Error("At least one valid permission is required");
  }

  const updated: AdminRole = {
    ...existing,
    name: data.name ?? existing.name,
    slug: data.slug ?? existing.slug,
    description: data.description ?? existing.description,
    permissions,
    updatedAt: new Date().toISOString(),
  };

  roleStore.set([...list.slice(0, index), updated, ...list.slice(index + 1)]);
  return { ...updated };
}

export function deleteRole(id: string): void {
  const list = getRoles();
  const role = list.find((r) => r.id === id);
  if (!role) throw new Error("Role not found");
  if (role.isSystem) throw new Error("System roles cannot be deleted");
  if ((role.userCount ?? 0) > 0) {
    throw new Error("Cannot delete a role that is assigned to users");
  }

  roleStore.set(list.filter((r) => r.id !== id));
}

export function resetRoleStore(): void {
  roleStore.reset();
}
