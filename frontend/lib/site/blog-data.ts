import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { BlogPost } from "@/types/blog";
import {
  getBlogCategories,
  getPublishedPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/mock/blog-store";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getSiteLayoutData } from "@/lib/site/public-data";
import {
  emptyPaginationMeta,
  paginateArray,
  type PaginationMeta,
} from "@/lib/site/pagination";
import type { Metadata } from "next";

export interface BlogListingHero {
  badge: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
}

export interface BlogListingData {
  posts: BlogPost[];
  categories: string[];
  mediaMap: Record<string, string>;
  hero: BlogListingHero;
  meta: PaginationMeta;
}

export interface BlogDetailData {
  post: BlogPost;
  imageUrl: string | null;
  related: BlogPost[];
  mediaMap: Record<string, string>;
}

type BlogSeoPayload = {
  metaTitle?: string;
  metaDescription?: string;
  ogImageId?: string | null;
  ogImageUrl?: string | null;
} | null;

type LaravelBlogListResponse = {
  success?: boolean;
  data?: {
    posts?: BlogPost[];
    categories?: string[];
    meta?: PaginationMeta;
    seo?: BlogSeoPayload;
  };
};

type LaravelBlogDetailResponse = {
  success?: boolean;
  data?: {
    post?: BlogPost;
    related?: BlogPost[];
  };
  errors?: { form?: string };
};

type LaravelBlogSlugsResponse = {
  success?: boolean;
  data?: string[];
};

function resolvePostImage(
  post: BlogPost,
  mediaMap: Record<string, string>
): string | null {
  if (post.imageUrl) return post.imageUrl;
  if (post.imageId && mediaMap[post.imageId]) return mediaMap[post.imageId];
  return null;
}

function withResolvedImages(
  posts: BlogPost[],
  mediaMap: Record<string, string>
): BlogPost[] {
  return posts.map((post) => ({
    ...post,
    imageUrl: resolvePostImage(post, mediaMap),
  }));
}

function heroFromSeo(
  seo: BlogSeoPayload,
  mediaMap: Record<string, string>
): BlogListingHero {
  const titleFromSeo = seo?.metaTitle?.split("|")[0]?.trim();
  return {
    badge: "Travel blog",
    title: titleFromSeo || "Guides, tips & stories from the trail",
    subtitle:
      seo?.metaDescription ||
      "Expert advice from our trip leaders to help you plan smarter Himalayan adventures.",
    imageUrl:
      seo?.ogImageUrl ??
      (seo?.ogImageId ? mediaMap[seo.ogImageId] ?? null : null),
  };
}

async function fetchLaravelBlogListing(params?: {
  category?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}): Promise<BlogListingData | null> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.tag) query.set("tag", params.tag);
  if (params?.page) query.set("page", String(params.page));
  if (params?.perPage) query.set("per_page", String(params.perPage));
  const qs = query.toString();

  const { res, data } = await laravelFetch<LaravelBlogListResponse>(
    `/v1/blogs${qs ? `?${qs}` : ""}`
  );

  if (!res.ok || !data.success || !data.data) return null;

  const layout = await getSiteLayoutData();
  const mediaMap = layout.mediaMap;

  return {
    posts: withResolvedImages(data.data.posts ?? [], mediaMap),
    categories: data.data.categories ?? [],
    mediaMap,
    hero: heroFromSeo(data.data.seo ?? null, mediaMap),
    meta: data.data.meta ?? emptyPaginationMeta(params?.perPage ?? 9),
  };
}

async function fetchLaravelBlogDetail(slug: string): Promise<BlogDetailData | null> {
  const { res, data } = await laravelFetch<LaravelBlogDetailResponse>(
    `/v1/blogs/${encodeURIComponent(slug)}`
  );

  if (!res.ok || !data.success || !data.data?.post) return null;

  const layout = await getSiteLayoutData();
  const mediaMap = layout.mediaMap;
  const post = {
    ...data.data.post,
    imageUrl: resolvePostImage(data.data.post, mediaMap),
  };

  return {
    post,
    imageUrl: post.imageUrl ?? null,
    related: withResolvedImages(data.data.related ?? [], mediaMap),
    mediaMap,
  };
}

async function getMockBlogListingData(params?: {
  category?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}): Promise<BlogListingData> {
  const layout = await getSiteLayoutData();
  const seo = getSeoByPageKey("blog");
  const mediaMap = layout.mediaMap;
  const titleFromSeo = seo?.metaTitle?.split("|")[0]?.trim();
  const heroImageId = seo?.ogImageId ?? "5";
  let posts = getPublishedPosts();
  if (params?.category) posts = posts.filter((p) => p.category === params.category);
  if (params?.tag) {
    posts = posts.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === params.tag!.toLowerCase())
    );
  }
  const perPage = params?.perPage ?? 9;
  const paged = paginateArray(posts, params?.page ?? 1, perPage);

  return {
    posts: withResolvedImages(paged.items, mediaMap),
    categories: getBlogCategories(),
    mediaMap,
    hero: {
      badge: "Travel blog",
      title: titleFromSeo || "Guides, tips & stories from the trail",
      subtitle:
        seo?.metaDescription ||
        "Expert advice from our trip leaders to help you plan smarter Himalayan adventures.",
      imageUrl: heroImageId ? mediaMap[heroImageId] ?? null : null,
    },
    meta: paged.meta,
  };
}

async function getMockBlogDetailData(slug: string): Promise<BlogDetailData | null> {
  const post = getPublishedPostBySlug(slug);
  if (!post) return null;

  const layout = await getSiteLayoutData();
  const mediaMap = layout.mediaMap;
  const resolved = { ...post, imageUrl: resolvePostImage(post, mediaMap) };

  return {
    post: resolved,
    imageUrl: resolved.imageUrl ?? null,
    related: withResolvedImages(getRelatedPosts(slug, 3), mediaMap),
    mediaMap,
  };
}

export async function getBlogListingData(params?: {
  category?: string;
  tag?: string;
  page?: number;
  perPage?: number;
}): Promise<BlogListingData> {
  if (useLaravelApi()) {
    try {
      const fromApi = await fetchLaravelBlogListing(params);
      if (fromApi) return fromApi;
    } catch {
      // fall through to mock
    }
  }
  return getMockBlogListingData(params);
}

export async function getBlogDetailData(
  slug: string
): Promise<BlogDetailData | null> {
  if (useLaravelApi()) {
    try {
      const fromApi = await fetchLaravelBlogDetail(slug);
      if (fromApi) return fromApi;
    } catch {
      // fall through to mock
    }
  }
  return getMockBlogDetailData(slug);
}

export async function getBlogSlugs(): Promise<string[]> {
  if (useLaravelApi()) {
    try {
      const { res, data } = await laravelFetch<LaravelBlogSlugsResponse>(
        "/v1/blogs/slugs"
      );
      if (res.ok && data.success && Array.isArray(data.data)) {
        return data.data;
      }
    } catch {
      // fall through
    }
  }
  return getPublishedPosts().map((p) => p.slug);
}

export async function buildBlogPostMetadata(slug: string): Promise<Metadata> {
  const detail = await getBlogDetailData(slug);
  if (!detail) return { title: "Article not found" };

  const { post, imageUrl } = detail;
  const canonical = `https://backpackclan.com/blog/${post.slug}`;

  return {
    title: `${post.title} | Backpackclan Blog`,
    description: post.excerpt,
    alternates: { canonical },
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: canonical,
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: post.title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildBlogPostJsonLd(post: BlogPost, imageUrl: string | null) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorRole,
    },
    publisher: {
      "@type": "Organization",
      name: "Backpackclan",
      logo: {
        "@type": "ImageObject",
        url: "https://backpackclan.com/logo.png",
      },
    },
    mainEntityOfPage: `https://backpackclan.com/blog/${post.slug}`,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    keywords: post.tags.join(", "),
    articleSection: post.category,
    wordCount: post.content.join(" ").split(/\s+/).filter(Boolean).length,
    timeRequired: `PT${post.readTime}M`,
  };
}

/** @deprecated prefer resolve via getBlog* helpers */
export async function getMediaMapForBlog(): Promise<Record<string, string>> {
  const layout = await getSiteLayoutData();
  return layout.mediaMap;
}
