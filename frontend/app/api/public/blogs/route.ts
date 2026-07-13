import { NextResponse } from "next/server";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { mockDelay } from "@/lib/mock/api-client";
import { getBlogCategories, getPublishedPosts } from "@/lib/mock/blog-store";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getMediaMap } from "@/lib/site/seo-metadata";
import { paginateArray } from "@/lib/site/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (useLaravelApi()) {
    const qs = searchParams.toString();
    const { res, data } = await laravelFetch(`/v1/blogs${qs ? `?${qs}` : ""}`);
    return NextResponse.json(data, { status: res.status });
  }

  await mockDelay(150);
  const category = searchParams.get("category") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(48, Math.max(1, Number(searchParams.get("per_page") || 9)));

  let posts = getPublishedPosts();
  if (category) posts = posts.filter((p) => p.category === category);
  if (tag) {
    posts = posts.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  const seo = getSeoByPageKey("blog");
  const mediaMap = getMediaMap();
  const paged = paginateArray(posts, page, perPage);

  return NextResponse.json({
    success: true,
    data: {
      posts: paged.items,
      categories: getBlogCategories(),
      meta: paged.meta,
      seo: seo
        ? {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            ogImageId: seo.ogImageId,
            ogImageUrl: seo.ogImageId ? mediaMap[seo.ogImageId] ?? null : null,
          }
        : null,
    },
  });
}
