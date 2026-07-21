import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { getHomepageData } from "@/lib/site/public-data";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const data = await getHomepageData();

  return NextResponse.json({
    success: true,
    data: {
      sections: data.sections,
      trips: data.trips,
      secondaryBanner: data.secondaryBanner,
      offerBanners: data.offerBanners,
      destinations: data.destinations,
      categories: data.categories,
      mediaMap: data.mediaMap,
    },
  });
}
