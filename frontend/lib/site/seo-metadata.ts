import type { Metadata } from "next";
import type { RobotsDirective, SeoMeta } from "@/types/seo";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getAllMedia } from "@/lib/mock/media-store";
import { getSiteLayoutData } from "@/lib/site/public-data";

function parseRobots(directive: RobotsDirective): Metadata["robots"] {
  return {
    index: !directive.includes("noindex"),
    follow: !directive.includes("nofollow"),
  };
}

export function getMediaMap(): Record<string, string> {
  return Object.fromEntries(getAllMedia().map((m) => [m.id, m.url]));
}

export async function getMediaMapAsync(): Promise<Record<string, string>> {
  if (useLaravelApi()) {
    try {
      const layout = await getSiteLayoutData();
      if (Object.keys(layout.mediaMap).length > 0) return layout.mediaMap;
    } catch {
      // fall through
    }
  }
  return getMediaMap();
}

type LaravelSeoResponse = {
  success?: boolean;
  data?: SeoMeta & {
    ogImageUrl?: string | null;
    label?: string;
    path?: string;
  };
};

export function seoMetaToMetadata(
  seo: SeoMeta & { ogImageUrl?: string | null },
  mediaMap: Record<string, string> = getMediaMap()
): Metadata {
  const ogImage =
    seo.ogImageUrl ||
    (seo.ogImageId && mediaMap[seo.ogImageId] ? mediaMap[seo.ogImageId] : undefined);

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: seo.canonicalUrl ? { canonical: seo.canonicalUrl } : undefined,
    robots: parseRobots(seo.robots),
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: seo.metaTitle,
      description: seo.metaDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

async function fetchLaravelSeo(
  pageKey: string
): Promise<(SeoMeta & { ogImageUrl?: string | null }) | null> {
  const { res, data } = await laravelFetch<LaravelSeoResponse>(
    `/v1/site/seo/${encodeURIComponent(pageKey)}`
  );
  if (!res.ok || !data.success || !data.data) return null;
  return data.data;
}

export async function buildPageMetadata(
  pageKey: string,
  fallback?: { title: string; description?: string }
): Promise<Metadata> {
  if (useLaravelApi()) {
    try {
      const seo = await fetchLaravelSeo(pageKey);
      if (seo) {
        const mediaMap = await getMediaMapAsync();
        return seoMetaToMetadata(seo, mediaMap);
      }
    } catch {
      // fall through
    }
  }

  const seo = getSeoByPageKey(pageKey);
  if (seo) return seoMetaToMetadata(seo);
  if (fallback) {
    return {
      title: fallback.title,
      description: fallback.description,
    };
  }
  return {};
}

export async function getPageJsonLd(pageKey: string): Promise<string | null> {
  if (useLaravelApi()) {
    try {
      const seo = await fetchLaravelSeo(pageKey);
      if (seo?.schemaJson?.trim()) return seo.schemaJson.trim();
    } catch {
      // fall through
    }
  }

  const seo = getSeoByPageKey(pageKey);
  if (!seo?.schemaJson?.trim()) return null;
  return seo.schemaJson.trim();
}
