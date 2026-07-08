import type { Metadata } from "next";
import type { RobotsDirective, SeoMeta } from "@/types/seo";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getAllMedia } from "@/lib/mock/media-store";

function parseRobots(directive: RobotsDirective): Metadata["robots"] {
  return {
    index: !directive.includes("noindex"),
    follow: !directive.includes("nofollow"),
  };
}

export function getMediaMap(): Record<string, string> {
  return Object.fromEntries(getAllMedia().map((m) => [m.id, m.url]));
}

export function seoMetaToMetadata(
  seo: SeoMeta,
  mediaMap: Record<string, string> = getMediaMap()
): Metadata {
  const ogImage =
    seo.ogImageId && mediaMap[seo.ogImageId] ? mediaMap[seo.ogImageId] : undefined;

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

export function buildPageMetadata(
  pageKey: string,
  fallback?: { title: string; description?: string }
): Metadata {
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

export function getPageJsonLd(pageKey: string): string | null {
  const seo = getSeoByPageKey(pageKey);
  if (!seo?.schemaJson?.trim()) return null;
  return seo.schemaJson.trim();
}
