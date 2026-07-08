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
  { id: "25", slug: "categories.view", name: "View Categories", group: "categories", description: "View trip categories" },
  { id: "26", slug: "categories.create", name: "Create Categories", group: "categories", description: "Create trip categories" },
  { id: "27", slug: "categories.update", name: "Update Categories", group: "categories", description: "Edit trip categories" },
  { id: "28", slug: "categories.delete", name: "Delete Categories", group: "categories", description: "Delete trip categories" },
  { id: "29", slug: "destinations.view", name: "View Destinations", group: "destinations", description: "View destination hub pages" },
  { id: "30", slug: "destinations.create", name: "Create Destinations", group: "destinations", description: "Create destination hub pages" },
  { id: "31", slug: "destinations.update", name: "Update Destinations", group: "destinations", description: "Edit destination hub pages" },
  { id: "32", slug: "destinations.delete", name: "Delete Destinations", group: "destinations", description: "Delete destination hub pages" },
  { id: "33", slug: "trips.view", name: "View Trips", group: "trips", description: "View travel products" },
  { id: "34", slug: "trips.create", name: "Create Trips", group: "trips", description: "Create travel products" },
  { id: "35", slug: "trips.update", name: "Update Trips", group: "trips", description: "Edit travel products" },
  { id: "36", slug: "trips.delete", name: "Delete Trips", group: "trips", description: "Delete travel products" },
  { id: "37", slug: "departures.view", name: "View Departures", group: "departures", description: "View departure calendar and inventory" },
  { id: "38", slug: "departures.create", name: "Create Departures", group: "departures", description: "Create departures and seat inventory" },
  { id: "39", slug: "departures.update", name: "Update Departures", group: "departures", description: "Edit departures and seat counts" },
  { id: "40", slug: "departures.delete", name: "Delete Departures", group: "departures", description: "Delete departures" },
  { id: "41", slug: "pricing.view", name: "View Pricing", group: "pricing", description: "View trip and departure pricing" },
  { id: "42", slug: "pricing.update", name: "Update Pricing", group: "pricing", description: "Edit trip and departure pricing" },
  { id: "43", slug: "blogs.view", name: "View Blogs", group: "blogs", description: "View blog posts" },
  { id: "44", slug: "blogs.create", name: "Create Blogs", group: "blogs", description: "Create blog posts" },
  { id: "45", slug: "blogs.update", name: "Update Blogs", group: "blogs", description: "Edit blog posts and publish status" },
  { id: "46", slug: "blogs.delete", name: "Delete Blogs", group: "blogs", description: "Delete blog posts" },
];

const ALL_SLUGS = MOCK_PERMISSIONS.map((p) => p.slug);

const EDITOR_SLUGS = ALL_SLUGS.filter(
  (s) =>
    !s.startsWith("users.") &&
    !s.startsWith("roles.") &&
    !s.startsWith("settings.") &&
    !s.endsWith(".delete")
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
