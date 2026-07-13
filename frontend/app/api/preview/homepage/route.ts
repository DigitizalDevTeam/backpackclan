import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { mockDelay } from "@/lib/mock/api-client";
import { getEnabledSections } from "@/lib/mock/homepage-store";
import { getActiveBannersByPlacement } from "@/lib/mock/banner-store";
import { getPublishedDestinations } from "@/lib/mock/destination-store";
import { getPublishedPublicTrips } from "@/lib/mock/admin-trip-store";
import { getPublishedPosts } from "@/lib/mock/blog-store";
import { getAllMedia } from "@/lib/mock/media-store";
import {
  hydrateHomepageSection,
  resolvePopularTrips,
} from "@/lib/homepage/resolve";
import type { PopularTripsContent } from "@/types/homepage";
import { useLaravelApi } from "@/lib/api/backend";
import { proxyToLaravel } from "@/lib/api/proxy";

export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  if (useLaravelApi()) {
    return proxyToLaravel(session!, "/v1/admin/homepage/sections/enabled");
  }

  await mockDelay(200);
  const mediaMap = Object.fromEntries(getAllMedia().map((m) => [m.id, m.url]));
  const catalog = {
    destinations: getPublishedDestinations(),
    trips: getPublishedPublicTrips(),
    blogs: getPublishedPosts(),
    mediaMap,
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
  const secondaryBanner = getActiveBannersByPlacement("homepage_secondary")[0] ?? null;
  const offerBanners = getActiveBannersByPlacement("homepage_secondary");

  return NextResponse.json({
    success: true,
    data: { sections, trips, secondaryBanner, offerBanners },
  });
}
