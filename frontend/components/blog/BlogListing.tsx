"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { BlogPost } from "@/types/blog";
import type { PaginationMeta } from "@/lib/site/pagination";
import { BlogCard } from "@/components/blog/BlogCard";
import { PaginationControls } from "@/components/site/PaginationControls";
import { cn } from "@/lib/utils";

interface BlogListingProps {
  posts: BlogPost[];
  categories: string[];
  mediaMap: Record<string, string>;
  meta: PaginationMeta;
  initialCategory?: string;
  initialTag?: string;
}

export function BlogListing({
  posts,
  categories,
  mediaMap,
  meta,
  initialCategory = "All",
  initialTag,
}: BlogListingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? initialCategory;
  const activeTag = searchParams.get("tag") ?? initialTag ?? "";
  const [featured, ...rest] = posts;

  function selectCategory(cat: string) {
    const params = new URLSearchParams();
    if (cat !== "All") params.set("category", cat);
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  }

  function clearTag() {
    const params = new URLSearchParams();
    if (activeCategory && activeCategory !== "All") {
      params.set("category", activeCategory);
    }
    const qs = params.toString();
    router.push(qs ? `/blog?${qs}` : "/blog");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => selectCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              activeCategory === cat && !activeTag
                ? "bg-[#FFD200] text-black shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-orange-50 hover:text-[#F58220]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeTag ? (
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-600">
          <span>
            Filtered by tag:{" "}
            <strong className="text-[#F58220]">{activeTag}</strong>
          </span>
          <button
            type="button"
            onClick={clearTag}
            className="font-semibold text-slate-500 underline hover:text-[#F58220]"
          >
            Clear
          </button>
        </div>
      ) : null}

      {posts.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No articles in this {activeTag ? "tag" : "category"} yet. Publish posts from Admin →
          Blogs.
        </p>
      ) : (
        <div className="space-y-8">
          {featured ? (
            <BlogCard
              post={featured}
              imageUrl={
                featured.imageUrl ??
                (featured.imageId ? mediaMap[featured.imageId] ?? null : null)
              }
              featured
            />
          ) : null}
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                imageUrl={
                  post.imageUrl ??
                  (post.imageId ? mediaMap[post.imageId] ?? null : null)
                }
              />
            ))}
          </div>
          <PaginationControls
            meta={meta}
            pathname="/blog"
            searchParams={{
              category: activeCategory !== "All" ? activeCategory : undefined,
              tag: activeTag || undefined,
            }}
          />
          {meta.total > 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              Showing {meta.from}–{meta.to} of {meta.total} articles
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
