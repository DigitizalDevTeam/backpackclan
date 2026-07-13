import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getSiteLayoutDataSync } from "@/lib/site/public-data";

export async function GET() {
  if (useLaravelApi()) {
    const { res, data } = await laravelFetch("/v1/site/layout");
    return NextResponse.json(data, { status: res.status });
  }

  const layout = getSiteLayoutDataSync();
  return NextResponse.json({
    success: true,
    data: {
      settings: layout.settings,
      menus: {
        header: layout.headerMenu,
        footer: layout.footerMenu,
        mobile: layout.mobileMenu,
      },
      destinationLinks: layout.destinationLinks,
      mediaMap: layout.mediaMap,
    },
  });
}
