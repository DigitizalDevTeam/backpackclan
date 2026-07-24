"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            rating >= i + 1 || rating > i
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200"
          )}
        />
      ))}
    </div>
  );
}

const STATS = [
  {
    id: "google",
    value: "4.5",
    label: "Google Rating",
    rating: 4.5,
    logo: "/certifications/google.svg",
  },
  {
    id: "tripadvisor",
    value: "4.7",
    label: "TripAdvisor",
    rating: 4.7,
    logo: "/certifications/tripadvisor.svg",
  },
  {
    id: "since",
    value: "2016",
    label: "Serving Since",
  },
  {
    id: "travelers",
    value: "18K+",
    label: "Happy Travellers",
  },
] as const;

export function HomeTrustStrip() {
  return (
    <div className="relative z-10 -mt-8 site-container sm:-mt-10">
      <div className="rounded-t-2xl border border-slate-200/80 bg-white px-3 py-4 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)] sm:px-2 sm:py-5">
        <div className="grid grid-cols-2 divide-slate-100 sm:grid-cols-4 sm:divide-x">
          {STATS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-center gap-3 px-3 py-3 sm:gap-4 sm:px-5 sm:py-2"
            >
              {"logo" in item && item.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo}
                  alt=""
                  className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
                />
              ) : null}

              <div className="min-w-0 text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center">
                  <p className="font-display text-2xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-[1.75rem]">
                    {item.value}
                  </p>
                  {"rating" in item && item.rating ? <Stars rating={item.rating} /> : null}
                </div>
                <p className="mt-0.5 text-xs font-semibold text-slate-600 sm:text-sm">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
