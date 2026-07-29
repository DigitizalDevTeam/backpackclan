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
    id: "facebook",
    value: "4.6",
    label: "230 reviews",
    rating: 4.6,
    logo: "/certifications/facebook.svg",
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
    <div className="relative z-10 border-y border-slate-200/80 bg-[#f3f4f6]">
      <div className="site-container">
        <div className="grid grid-cols-2 divide-y divide-slate-200/80 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {STATS.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3"
            >
              {"logo" in item && item.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo}
                  alt=""
                  className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8"
                />
              ) : null}

              <div className="min-w-0 text-left leading-tight">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-base font-semibold tabular-nums tracking-tight text-slate-900 sm:text-lg">
                    {item.value}
                  </p>
                  {"rating" in item && item.rating ? <Stars rating={item.rating} /> : null}
                </div>
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
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
