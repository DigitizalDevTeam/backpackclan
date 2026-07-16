import type { AuthUser } from "@/types/auth";
import { hasPermission } from "@/lib/auth/permissions";
import {
  LayoutDashboard,
  Image,
  Search,
  Menu,
  Flag,
  Home,
  Settings,
  Users,
  Shield,
  ExternalLink,
  Layers,
  Cog,
  MapPin,
  Luggage,
  Calendar,
  Tags,
  IndianRupee,
  Compass,
  Newspaper,
  Ticket,
  Percent,
  Inbox,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  /** Legacy mock fallback when permissions array is empty */
  roles?: string[];
}

export interface NavGroup {
  label?: string;
  icon?: LucideIcon;
  items: NavItem[];
}

export const adminNavGroups: NavGroup[] = [
  {
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      {
        title: "Bookings",
        href: "/admin/bookings",
        icon: Ticket,
        permission: "bookings.view",
      },
      {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
        permission: "bookings.view",
      },
      {
        title: "Coupons",
        href: "/admin/coupons",
        icon: Percent,
        permission: "coupons.view",
      },
      {
        title: "Leads",
        href: "/admin/leads",
        icon: Inbox,
        permission: "leads.view",
      },
    ],
  },
  {
    label: "Content",
    icon: Layers,
    items: [
      { title: "Homepage", href: "/admin/homepage", icon: Home, permission: "homepage.view" },
      { title: "Banners", href: "/admin/banners", icon: Flag, permission: "banners.view" },
      { title: "Blog", href: "/admin/blogs", icon: Newspaper, permission: "blogs.view" },
      { title: "Media", href: "/admin/media", icon: Image, permission: "media.view" },
      { title: "Menus", href: "/admin/menus", icon: Menu, permission: "menus.view" },
      { title: "SEO", href: "/admin/seo", icon: Search, permission: "seo.view" },
    ],
  },
  {
    label: "Travel Management",
    icon: Compass,
    items: [
      { title: "Trips", href: "/admin/trips", icon: Luggage, permission: "trips.view" },
      {
        title: "Destinations",
        href: "/admin/destinations",
        icon: MapPin,
        permission: "destinations.view",
      },
      {
        title: "Departures",
        href: "/admin/departures",
        icon: Calendar,
        permission: "departures.view",
      },
      {
        title: "Categories",
        href: "/admin/categories",
        icon: Tags,
        permission: "categories.view",
      },
      {
        title: "Pricing Rules",
        href: "/admin/pricing",
        icon: IndianRupee,
        permission: "pricing.view",
      },
    ],
  },
  {
    label: "User Management",
    icon: Users,
    items: [
      { title: "Users", href: "/admin/users", icon: Users, permission: "users.view" },
      {
        title: "Roles & Permissions",
        href: "/admin/roles",
        icon: Shield,
        permission: "roles.view",
      },
    ],
  },
  {
    label: "System",
    icon: Cog,
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.view" },
    ],
  },
];

export const adminNavItems: NavItem[] = adminNavGroups.flatMap((group) => group.items);

export const previewNavItem = {
  title: "Preview Homepage",
  href: "/preview/homepage",
  icon: ExternalLink,
};

function canAccessNavItem(user: AuthUser, item: NavItem): boolean {
  const perms = user.permissions ?? [];

  if (perms.length > 0) {
    return !item.permission || hasPermission(user, item.permission);
  }

  const legacyRoles: Record<string, string[]> = {
    admin: adminNavItems.map((i) => i.href),
    editor: adminNavItems
      .filter(
        (i) =>
          !["/admin/settings", "/admin/users", "/admin/roles"].includes(i.href)
      )
      .map((i) => i.href),
    viewer: adminNavItems
      .filter(
        (i) =>
          !["/admin/settings", "/admin/users", "/admin/roles"].includes(i.href)
      )
      .map((i) => i.href),
  };

  const allowed = legacyRoles[user.role] ?? [];
  return allowed.includes(item.href);
}

export function getNavGroupsForUser(user: AuthUser): NavGroup[] {
  return adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessNavItem(user, item)),
    }))
    .filter((group) => group.items.length > 0);
}

/** @deprecated Use getNavGroupsForUser */
export function getNavItemsForUser(user: AuthUser): NavItem[] {
  return getNavGroupsForUser(user).flatMap((group) => group.items);
}
