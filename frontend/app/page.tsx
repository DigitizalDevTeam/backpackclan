import type { Metadata } from "next";
import { HomeMarketing } from "@/components/homepage/HomeMarketing";
import { SitePageShell } from "@/components/site/SitePageShell";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getHomepageData } from "@/lib/site/public-data";
import { buildMarketingHomepageView } from "@/lib/site/home-categories";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("homepage", {
    title: "Backpackclan — Travel Explore Share",
    description:
      "Premium motor biking, backpacking, treks, and custom departures across India and beyond.",
  });
}

export default async function HomePage() {
  const data = await getHomepageData();
  const view = buildMarketingHomepageView(data.sections, data.mediaMap, {
    categories: data.categories,
    destinations: data.destinations,
    trips: data.trips,
  });

  return (
    <SitePageShell seoPageKey="homepage">
      <HomeMarketing view={view} />
    </SitePageShell>
  );
}
