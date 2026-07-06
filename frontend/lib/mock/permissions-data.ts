import type { Permission, PermissionGroup } from "@/types/role";

export const MOCK_PERMISSIONS: Permission[] = [
  { id: "1", slug: "users.view", name: "View Users", group: "users", description: "View admin user list and profiles" },
  { id: "2", slug: "users.create", name: "Create Users", group: "users", description: "Create new admin users" },
  { id: "3", slug: "users.update", name: "Update Users", group: "users", description: "Edit admin users and change passwords" },
  { id: "4", slug: "users.delete", name: "Delete Users", group: "users", description: "Remove admin users" },
  { id: "5", slug: "roles.view", name: "View Roles", group: "roles", description: "View roles and their permissions" },
  { id: "6", slug: "roles.create", name: "Create Roles", group: "roles", description: "Create custom admin roles" },
  { id: "7", slug: "roles.update", name: "Update Roles", group: "roles", description: "Edit roles and assign permissions" },
  { id: "8", slug: "roles.delete", name: "Delete Roles", group: "roles", description: "Delete custom roles" },
  { id: "9", slug: "media.view", name: "View Media", group: "media", description: "Browse media library" },
  { id: "10", slug: "media.upload", name: "Upload Media", group: "media", description: "Upload files to media library" },
  { id: "11", slug: "media.update", name: "Update Media", group: "media", description: "Edit media metadata" },
  { id: "12", slug: "media.delete", name: "Delete Media", group: "media", description: "Delete media files" },
  { id: "13", slug: "seo.view", name: "View SEO", group: "seo", description: "View SEO settings per page" },
  { id: "14", slug: "seo.update", name: "Update SEO", group: "seo", description: "Edit SEO meta and OG settings" },
  { id: "15", slug: "menus.view", name: "View Menus", group: "menus", description: "View navigation menus" },
  { id: "16", slug: "menus.update", name: "Update Menus", group: "menus", description: "Edit menu structure and items" },
  { id: "17", slug: "banners.view", name: "View Banners", group: "banners", description: "View promotional banners" },
  { id: "18", slug: "banners.create", name: "Create Banners", group: "banners", description: "Create new banners" },
  { id: "19", slug: "banners.update", name: "Update Banners", group: "banners", description: "Edit banners and toggle status" },
  { id: "20", slug: "banners.delete", name: "Delete Banners", group: "banners", description: "Delete banners" },
  { id: "21", slug: "homepage.view", name: "View Homepage", group: "homepage", description: "View homepage sections" },
  { id: "22", slug: "homepage.update", name: "Update Homepage", group: "homepage", description: "Edit and reorder homepage sections" },
  { id: "23", slug: "settings.view", name: "View Settings", group: "settings", description: "View global site settings" },
  { id: "24", slug: "settings.update", name: "Update Settings", group: "settings", description: "Edit global site settings" },
];

const ALL_SLUGS = MOCK_PERMISSIONS.map((p) => p.slug);

const EDITOR_SLUGS = ALL_SLUGS.filter(
  (s) =>
    !s.startsWith("users.") &&
    !s.startsWith("roles.") &&
    !s.startsWith("settings.")
);

const VIEWER_SLUGS = ALL_SLUGS.filter((s) => s.endsWith(".view"));

export function getAllPermissionSlugs(): string[] {
  return [...ALL_SLUGS];
}

export function getPermissionGroups(): PermissionGroup[] {
  const groups = new Map<string, Permission[]>();
  for (const perm of MOCK_PERMISSIONS) {
    const list = groups.get(perm.group) ?? [];
    list.push(perm);
    groups.set(perm.group, list);
  }
  return Array.from(groups.entries()).map(([group, permissions]) => ({
    group,
    permissions,
  }));
}

export const ROLE_PERMISSION_PRESETS: Record<string, string[]> = {
  "super-admin": ALL_SLUGS,
  admin: ALL_SLUGS,
  editor: EDITOR_SLUGS,
  viewer: VIEWER_SLUGS,
};
