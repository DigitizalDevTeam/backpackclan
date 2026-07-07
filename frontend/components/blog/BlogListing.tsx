"use client";

import { useMemo, useState } from "react";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { cn } from "@/lib/utils";

interface BlogListingProps {
  posts: BlogPost[];
  categories: string[];
  mediaMap: Record<string, string>;
}

export function BlogListing({ posts, categories, mediaMap }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  const [featured, ...rest] = filtered;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex flex-wrap gap-2">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No articles in this category yet.</p>
      ) : (
        <div className="space-y-8">
          {featured ? (
            <BlogCard
              post={featured}
              imageUrl={mediaMap[featured.imageId] ?? null}
              featured
            />
          ) : null}
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                imageUrl={mediaMap[post.imageId] ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
