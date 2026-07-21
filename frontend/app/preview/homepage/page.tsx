import { HomepagePreviewShell } from "@/components/homepage/HomepageRenderer";
import { HomeMarketing } from "@/components/homepage/HomeMarketing";
import { buildMarketingHomepageView } from "@/lib/site/home-categories";
import { getHomepageData } from "@/lib/site/public-data";

export default async function HomepagePreviewPage() {
  const data = await getHomepageData();
  const view = buildMarketingHomepageView(data.sections, data.mediaMap, {
    categories: data.categories,
    destinations: data.destinations,
    trips: data.trips,
    offerBanners: data.offerBanners,
  });

  return (
    <HomepagePreviewShell>
      <HomeMarketing view={view} />
    </HomepagePreviewShell>
  );
}
