import type { Metadata } from "next";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { SitePageShell } from "@/components/site/SitePageShell";
import { getHomepageData } from "@/lib/site/public-data";
import { buildPageMetadata } from "@/lib/site/seo-metadata";

export const metadata: Metadata = buildPageMetadata("homepage", {
  title: "Backpackclan — Adventure Tours in the Himalayas",
  description:
    "Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal.",
});

export default function HomePage() {
  const data = getHomepageData();

  return (
    <SitePageShell seoPageKey="homepage">
      <HomepageRenderer
        sections={data.sections}
        mediaMap={data.mediaMap}
        trips={data.trips}
        secondaryBanner={data.secondaryBanner}
      />
    </SitePageShell>
  );
}
