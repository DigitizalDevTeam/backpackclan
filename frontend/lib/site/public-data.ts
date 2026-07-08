import { getEnabledSections } from "@/lib/mock/homepage-store";
import { getAllMedia } from "@/lib/mock/media-store";
import { getActiveBannersByPlacement } from "@/lib/mock/banner-store";
import { getSettings } from "@/lib/mock/settings-store";
import { buildMenuTree, getMenuItems } from "@/lib/mock/menu-store";
import { getPublishedDestinations } from "@/lib/mock/destination-store";
import {
  hydrateHomepageSection,
  resolvePopularTrips,
} from "@/lib/homepage/resolve";
import type { MenuItemNode } from "@/types/menu";
import type { HomepageSection, PopularTripsContent } from "@/types/homepage";
import type { PublicTrip } from "@/types/trip";
import type { SiteSettings } from "@/types/settings";
import type { Banner } from "@/types/banner";

export interface FooterDestinationLink {
  label: string;
  href: string;
}

export interface SiteLayoutData {
  settings: SiteSettings;
  headerMenu: MenuItemNode[];
  footerMenu: MenuItemNode[];
  mobileMenu: MenuItemNode[];
  destinationLinks: FooterDestinationLink[];
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

function getDestinationFooterLinks(): FooterDestinationLink[] {
  return getPublishedDestinations()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8)
    .map((dest) => ({
      label: dest.name,
      href: `/destinations/${dest.slug}`,
    }));
}

export function getSiteLayoutData(): SiteLayoutData {
  const media = getAllMedia();
  return {
    settings: getSettings(),
    headerMenu: getActiveMenuTree("header"),
    footerMenu: getActiveMenuTree("footer"),
    mobileMenu: getActiveMenuTree("mobile"),
    destinationLinks: getDestinationFooterLinks(),
    mediaMap: Object.fromEntries(media.map((m) => [m.id, m.url])),
  };
}

export function getHomepageData(): HomepageData {
  const secondaryBanners = getActiveBannersByPlacement("homepage_secondary");
  const sections = getEnabledSections().map(hydrateHomepageSection);
  const popularSection = sections.find((s) => s.type === "popular_trips");
  const trips = popularSection
    ? resolvePopularTrips(popularSection.content as PopularTripsContent)
    : resolvePopularTrips({
        title: "",
        layout: "carousel",
        mode: "featured",
        tripIds: [],
        filterTags: [],
      });

  return {
    ...getSiteLayoutData(),
    sections,
    trips,
    secondaryBanner: secondaryBanners[0] ?? null,
  };
}
