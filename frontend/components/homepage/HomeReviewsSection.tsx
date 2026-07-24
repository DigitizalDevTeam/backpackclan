"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import { ScrollCarousel } from "@/components/homepage/ScrollCarousel";
import type { ResolvedTestimonials } from "@/lib/site/home-categories";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = ["#F58220", "#7BC043", "#0EA5E9", "#E11D48", "#8B5E3C"] as const;
const PREVIEW_LENGTH = 160;

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function ReviewCard({
  item,
  index,
}: {
  item: ResolvedTestimonials["items"][number];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const plain = item.text;
  const needsMore = plain.length > PREVIEW_LENGTH;
  const shown =
    !needsMore || expanded ? plain : `${plain.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
  const initial = item.name.trim().charAt(0).toUpperCase() || "?";
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100 sm:p-6">
      <span
        className="pointer-events-none absolute right-4 top-10 select-none font-serif text-7xl leading-none text-slate-100"
        aria-hidden
      >
        ”
      </span>

      <div className="relative flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
          style={{ backgroundColor: avatarColor }}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">{item.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <GoogleMark className="h-3.5 w-3.5" />
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < item.rating
                      ? "fill-[#F58220] text-[#F58220]"
                      : "fill-slate-200 text-slate-200"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        {item.reviewUrl ? (
          <a
            href={item.reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md p-1.5 text-[#F58220] transition hover:bg-orange-50"
            aria-label={`Open review by ${item.name}`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-slate-600">
        {shown}
        {needsMore ? (
          <>
            {" "}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="font-semibold text-[#F58220] hover:underline"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          </>
        ) : null}
      </p>

      <div className="mt-5 flex items-center gap-3 rounded-xl border border-orange-100 bg-[#FFF8F0] p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.tripImage}
          alt=""
          className="h-12 w-14 shrink-0 rounded-lg object-cover"
        />
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-800 sm:text-sm">
          {item.trip}
        </p>
        <Link
          href={item.tripHref}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F58220] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-[#e07418]"
        >
          Try Yourself
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export function HomeReviewsSection({ reviews }: { reviews: ResolvedTestimonials }) {
  if (!reviews.items.length) return null;

  return (
    <section className="site-section bg-[#F7F7F5]">
      <div className="site-container">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
            {reviews.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {reviews.title}
          </h2>
        </div>

        <ScrollCarousel
          itemClassName="w-[88%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
          showDots={false}
          arrowClassName="h-10 w-10 border-0 bg-[#F58220] text-white hover:bg-[#e07418] hover:text-white disabled:bg-slate-200 disabled:text-slate-400"
        >
          {reviews.items.map((item, index) => (
            <ReviewCard key={item.id} item={item} index={index} />
          ))}
        </ScrollCarousel>
      </div>
    </section>
  );
}
