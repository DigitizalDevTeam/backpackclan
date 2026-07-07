import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { BlogCard } from "@/components/blog/BlogCard";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/mock/blog-store";
import { getSiteLayoutData } from "@/lib/site/public-data";
import { formatDate } from "@/lib/site/format";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: `${post.title} | Backpackclan Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const layout = getSiteLayoutData();
  const imageUrl = layout.mediaMap[post.imageId] ?? null;
  const related = getRelatedPosts(slug, 3);

  return (
    <SitePageShell>
      <article>
        <div className="relative bg-slate-900 py-16 text-white sm:py-20">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
            </>
          ) : null}
          <div className="relative mx-auto max-w-3xl px-4">
            <Link
              href="/blog"
              className="mb-6 inline-flex items-center gap-1 text-sm text-teal-200 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to blog
            </Link>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-lg text-slate-300">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author} · {post.authorRole}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="prose prose-slate max-w-none">
            {post.content.map((paragraph, i) => (
              <p key={i} className="mb-5 text-base leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-8">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl font-bold">Related articles</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <BlogCard
                  key={r.id}
                  post={r}
                  imageUrl={layout.mediaMap[r.imageId] ?? null}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SitePageShell>
  );
}
