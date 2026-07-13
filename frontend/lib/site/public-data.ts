import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getEnabledSections } from "@/lib/mock/homepage-store";
import { getAllMedia } from "@/lib/mock/media-store";
import { getActiveBannersByPlacement } from "@/lib/mock/banner-store";
import { getSettings } from "@/lib/mock/settings-store";
import { buildMenuTree, getMenuItems } from "@/lib/mock/menu-store";
import { getPublishedDestinations } from "@/lib/mock/destination-store";
import { getPublishedPublicTrips } from "@/lib/mock/admin-trip-store";
import { getPublishedPosts } from "@/lib/mock/blog-store";
import { getActiveCategories } from "@/lib/mock/category-store";
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
  destinations: import("@/types/destination").Destination[];
  categories: import("@/types/category").Category[];
}

type LaravelSiteLayoutResponse = {
  success?: boolean;
  data?: {
    settings?: SiteSettings;
    menus?: {
      header?: MenuItemNode[];
      footer?: MenuItemNode[];
      mobile?: MenuItemNode[];
    };
    destinationLinks?: FooterDestinationLink[];
    mediaMap?: Record<string, string>;
  };
};

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

function getMockSiteLayoutData(): SiteLayoutData {
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

async function fetchLaravelSiteLayout(): Promise<SiteLayoutData | null> {
  const { res, data } = await laravelFetch<LaravelSiteLayoutResponse>("/v1/site/layout");
  if (!res.ok || !data.success || !data.data?.settings) return null;

  return {
    settings: data.data.settings,
    headerMenu: data.data.menus?.header ?? [],
    footerMenu: data.data.menus?.footer ?? [],
    mobileMenu: data.data.menus?.mobile ?? [],
    destinationLinks: data.data.destinationLinks ?? [],
    mediaMap: data.data.mediaMap ?? {},
  };
}

/** Prefer this in RSC / server code when Laravel may be enabled. */
export async function getSiteLayoutData(): Promise<SiteLayoutData> {
  if (useLaravelApi()) {
    try {
      const fromApi = await fetchLaravelSiteLayout();
      if (fromApi) return fromApi;
    } catch {
      // fall through to mock
    }
  }
  return getMockSiteLayoutData();
}

/** Sync mock-only accessor for rare non-async contexts. */
export function getSiteLayoutDataSync(): SiteLayoutData {
  return getMockSiteLayoutData();
}

export async function getHomepageData(): Promise<HomepageData> {
  const layout = await getSiteLayoutData();

  if (useLaravelApi()) {
    try {
      const fromApi = await fetchLaravelHomepage(layout);
      if (fromApi) return fromApi;
    } catch {
      // fall through to mock
    }
  }

  return getMockHomepageData(layout);
}

async function fetchLaravelHomepage(
  layout: SiteLayoutData
): Promise<HomepageData | null> {
  const { res, data } = await laravelFetch<{
    success?: boolean;
    data?: {
      sections?: HomepageSection[];
      banners?: Banner[];
      destinations?: import("@/types/destination").Destination[];
      categories?: import("@/types/category").Category[];
      trips?: PublicTrip[];
      blogs?: import("@/types/blog").BlogPost[];
    };
  }>("/v1/homepage");

  if (!res.ok || !data.success || !data.data) return null;

  const catalog = {
    destinations: data.data.destinations ?? [],
    trips: (data.data.trips ?? []).map((t) => ({
      ...t,
      imageId: t.imageId ?? "1",
      departureDates: t.departureDates ?? [],
      availableMonths: t.availableMonths ?? [],
    })),
    blogs: data.data.blogs ?? [],
    mediaMap: layout.mediaMap,
  };

  const sections = (data.data.sections ?? []).map((section) =>
    hydrateHomepageSection(section, catalog)
  );

  const popularSection = sections.find((s) => s.type === "popular_trips");
  const trips = popularSection
    ? resolvePopularTrips(popularSection.content as PopularTripsContent, catalog)
    : catalog.trips.filter((t) => t.isFeatured).slice(0, 8);

  const secondaryBanner =
    (data.data.banners ?? []).find((b) => b.placement === "homepage_secondary") ??
    null;

  return {
    ...layout,
    sections,
    trips,
    secondaryBanner,
    destinations: catalog.destinations,
    categories: data.data.categories ?? [],
  };
}

function getMockHomepageData(layout: SiteLayoutData): HomepageData {
  const secondaryBanners = getActiveBannersByPlacement("homepage_secondary");
  const destinations = getPublishedDestinations();
  const tripsAll = getPublishedPublicTrips();
  const blogs = getPublishedPosts();
  const catalog = {
    destinations,
    trips: tripsAll,
    blogs,
    mediaMap: layout.mediaMap,
  };

  const sections = getEnabledSections().map((section) =>
    hydrateHomepageSection(section, catalog)
  );
  const popularSection = sections.find((s) => s.type === "popular_trips");
  const trips = popularSection
    ? resolvePopularTrips(popularSection.content as PopularTripsContent, catalog)
    : resolvePopularTrips(
        {
          title: "",
          layout: "carousel",
          mode: "featured",
          tripIds: [],
          filterTags: [],
        },
        catalog
      );

  return {
    ...layout,
    sections,
    trips,
    secondaryBanner: secondaryBanners[0] ?? null,
    destinations,
    categories: getActiveCategories(),
  };
}
