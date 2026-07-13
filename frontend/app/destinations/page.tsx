import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { DestinationsListing } from "@/components/destinations/DestinationsListing";
import { getPublishedDestinationsAsync } from "@/lib/site/destination-data";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("destinations", {
    title: "Destinations — Ladakh, Spiti, Kashmir & More",
    description:
      "Explore Backpackclan destinations including Leh Ladakh, Spiti Valley, Kashmir, Bhutan, and Nepal.",
  });
}

export default async function DestinationsPage() {
  const [destinations, layout] = await Promise.all([
    getPublishedDestinationsAsync(),
    getSiteLayoutData(),
  ]);

  return (
    <SitePageShell seoPageKey="destinations">
      <DestinationsListing
        destinations={destinations}
        mediaMap={layout.mediaMap}
      />
    </SitePageShell>
  );
}
