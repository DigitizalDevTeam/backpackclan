import type { Metadata } from "next";
import { Suspense } from "react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { BlogListing } from "@/components/blog/BlogListing";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getBlogListingData } from "@/lib/site/blog-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("blog", {
    title: "Travel Blog — Backpackclan",
    description: "Travel guides, tips, and stories from the Backpackclan team.",
  });
}

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getBlogListingData({
    category: params.category,
    tag: params.tag,
    page,
    perPage: 9,
  });

  return (
    <SitePageShell seoPageKey="blog">
      <PageHero
        badge={data.hero.badge}
        title={data.hero.title}
        subtitle={data.hero.subtitle}
        imageUrl={data.hero.imageUrl ?? undefined}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
            Loading articles…
          </div>
        }
      >
        <BlogListing
          posts={data.posts}
          categories={data.categories}
          mediaMap={data.mediaMap}
          meta={data.meta}
          initialCategory={params.category ?? "All"}
          initialTag={params.tag}
        />
      </Suspense>
    </SitePageShell>
  );
}
