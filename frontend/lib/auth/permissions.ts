export const PERMISSIONS = {
  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_UPDATE: "roles.update",
  ROLES_DELETE: "roles.delete",
  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_UPDATE: "media.update",
  MEDIA_DELETE: "media.delete",
  SEO_VIEW: "seo.view",
  SEO_UPDATE: "seo.update",
  MENUS_VIEW: "menus.view",
  MENUS_UPDATE: "menus.update",
  BANNERS_VIEW: "banners.view",
  BANNERS_CREATE: "banners.create",
  BANNERS_UPDATE: "banners.update",
  BANNERS_DELETE: "banners.delete",
  HOMEPAGE_VIEW: "homepage.view",
  HOMEPAGE_UPDATE: "homepage.update",
  SETTINGS_VIEW: "settings.view",
  SETTINGS_UPDATE: "settings.update",
} as const;

export type PermissionSlug = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  user: { permissions?: string[] },
  permission: string
): boolean {
  return user.permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(
  user: { permissions?: string[] },
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(user, p));
}

export function canWriteContent(user: { permissions?: string[] }): boolean {
  return hasAnyPermission(user, [
    PERMISSIONS.MEDIA_UPLOAD,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.SEO_UPDATE,
    PERMISSIONS.MENUS_UPDATE,
    PERMISSIONS.BANNERS_CREATE,
    PERMISSIONS.BANNERS_UPDATE,
    PERMISSIONS.HOMEPAGE_UPDATE,
  ]);
}
