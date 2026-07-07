import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/site/format";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
  imageUrl: string | null;
  featured?: boolean;
}

export function BlogCard({ post, imageUrl, featured }: BlogCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-lg",
        featured ? "grid md:grid-cols-2" : "flex h-full flex-col"
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "relative block shrink-0 overflow-hidden",
          featured ? "aspect-[16/10] md:aspect-[4/3]" : "aspect-[16/10]"
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-200" />
        )}
        <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {post.category}
        </span>
      </Link>
      <div
        className={cn(
          "flex flex-col",
          featured ? "justify-center p-6 sm:p-8" : "flex-1 p-5"
        )}
      >
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readTime} min read
          </span>
        </div>
        <h2
          className={cn(
            "font-bold text-foreground",
            featured ? "text-2xl" : "text-lg"
          )}
        >
          <Link href={`/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>
            {post.author} · {post.authorRole}
          </span>
        </div>
      </div>
    </article>
  );
}
