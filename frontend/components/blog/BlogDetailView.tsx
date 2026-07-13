"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { formatDate } from "@/lib/site/format";

interface BlogDetailViewProps {
  post: BlogPost;
  imageUrl: string | null;
  related: BlogPost[];
  mediaMap: Record<string, string>;
}

export function BlogDetailView({
  post,
  imageUrl,
  related,
  mediaMap,
}: BlogDetailViewProps) {
  return (
    <>
      <article>
        <div className="relative overflow-hidden bg-[#0c0c0c] py-16 text-white sm:py-20">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/75 to-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,130,32,0.25),transparent_55%)]" />
          )}

          <div className="relative mx-auto max-w-3xl px-4">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1 text-sm text-[#FFD200] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            <span className="rounded-full bg-gradient-to-r from-[#F58220] to-[#FFD200] px-3 py-1 text-xs font-bold uppercase tracking-wide text-black">
              {post.category}
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-white/75">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#FFD200]" />
                {post.author} · {post.authorRole}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#FFD200]" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#FFD200]" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>

        {imageUrl ? (
          <div className="mx-auto max-w-4xl px-4">
            <div className="relative -mt-8 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5 sm:-mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={post.title}
                className="aspect-[21/9] w-full object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-5">
            {post.content.map((paragraph, i) => (
              <p key={i} className="text-base leading-relaxed text-slate-700 sm:text-[1.05rem]">
                {paragraph}
              </p>
            ))}
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-8">
              <Tag className="h-4 w-4 text-[#F58220]" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-[#F58220] transition hover:bg-[#FFD200] hover:text-black"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="mt-10 rounded-2xl border border-orange-100 bg-[#FFFBF5] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F58220]">
              Written by
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-slate-900">
              {post.author}
            </p>
            <p className="text-sm text-slate-500">{post.authorRole}</p>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-slate-100 bg-[#FFFBF5] py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F58220]">
                  Keep reading
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                  Related articles
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden text-sm font-semibold text-[#F58220] hover:underline sm:inline"
              >
                View all posts
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard
                  key={r.id}
                  post={r}
                  imageUrl={
                    r.imageUrl ?? (r.imageId ? mediaMap[r.imageId] ?? null : null)
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
