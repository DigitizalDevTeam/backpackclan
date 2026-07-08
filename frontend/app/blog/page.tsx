import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { BlogListing } from "@/components/blog/BlogListing";
import { getPublishedPosts, getBlogCategories } from "@/lib/mock/blog-store";
import { buildPageMetadata } from "@/lib/site/seo-metadata";
import { getSiteLayoutData } from "@/lib/site/public-data";

export const metadata = buildPageMetadata("blog", {
  title: "Travel Blog — Backpackclan",
  description: "Travel guides, tips, and stories from the Backpackclan team.",
});

export default function BlogPage() {
  const layout = getSiteLayoutData();
  const posts = getPublishedPosts();
  const categories = getBlogCategories();

  return (
    <SitePageShell seoPageKey="blog">
      <PageHero
        badge="Travel blog"
        title="Guides, tips & stories from the trail"
        subtitle="Expert advice from our trip leaders to help you plan smarter Himalayan adventures."
        imageUrl={layout.mediaMap["5"]}
      />
      <BlogListing posts={posts} categories={categories} mediaMap={layout.mediaMap} />
    </SitePageShell>
  );
}
