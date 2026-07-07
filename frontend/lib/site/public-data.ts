import { getEnabledSections } from "@/lib/mock/homepage-store";
import { getAllMedia } from "@/lib/mock/media-store";
import { getFeaturedTrips } from "@/lib/mock/trip-store";
import { getSettings } from "@/lib/mock/settings-store";
import { buildMenuTree, getMenuItems } from "@/lib/mock/menu-store";
import { getActiveBannersByPlacement } from "@/lib/mock/banner-store";
import type { MenuItemNode } from "@/types/menu";
import type { HomepageSection } from "@/types/homepage";
import type { PublicTrip } from "@/types/trip";
import type { SiteSettings } from "@/types/settings";
import type { Banner } from "@/types/banner";

export interface SiteLayoutData {
  settings: SiteSettings;
  headerMenu: MenuItemNode[];
  footerMenu: MenuItemNode[];
  mediaMap: Record<string, string>;
}

export interface HomepageData extends SiteLayoutData {
  sections: HomepageSection[];
  trips: PublicTrip[];
  secondaryBanner: Banner | null;
}

function menuIdBySlug(slug: "header" | "footer" | "mobile"): string {
  const map = { header: "1", footer: "2", mobile: "3" };
  return map[slug];
}

export function getActiveMenuTree(location: "header" | "footer" | "mobile"): MenuItemNode[] {
  const menuId = menuIdBySlug(location);
  const items = getMenuItems(menuId).filter((i) => i.isActive);
  return buildMenuTree(items);
}

export function getSiteLayoutData(): SiteLayoutData {
  const media = getAllMedia();
  return {
    settings: getSettings(),
    headerMenu: getActiveMenuTree("header"),
    footerMenu: getActiveMenuTree("footer"),
    mediaMap: Object.fromEntries(media.map((m) => [m.id, m.url])),
  };
}

export function getHomepageData(): HomepageData {
  const secondaryBanners = getActiveBannersByPlacement("homepage_secondary");

  return {
    ...getSiteLayoutData(),
    sections: getEnabledSections(),
    trips: getFeaturedTrips(8),
    secondaryBanner: secondaryBanners[0] ?? null,
  };
}
