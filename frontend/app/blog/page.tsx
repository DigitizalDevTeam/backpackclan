import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/SitePageShell";
import { PageHero } from "@/components/site/PageHero";
import { BlogListing } from "@/components/blog/BlogListing";
import { getAllPosts, getBlogCategories } from "@/lib/mock/blog-store";
import { getSeoByPageKey } from "@/lib/mock/seo-store";
import { getSiteLayoutData } from "@/lib/site/public-data";

const seo = getSeoByPageKey("blog");

export const metadata: Metadata = {
  title: seo?.metaTitle ?? "Travel Blog — Backpackclan",
  description: seo?.metaDescription,
};

export default function BlogPage() {
  const layout = getSiteLayoutData();
  const posts = getAllPosts();
  const categories = getBlogCategories();

  return (
    <SitePageShell>
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
