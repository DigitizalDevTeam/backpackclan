"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Percent, Tag } from "lucide-react";
import type { ResolvedOffer } from "@/lib/site/home-categories";
import { cn } from "@/lib/utils";

export function HomeOffersSlider({ offers }: { offers: ResolvedOffer[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = offers.length;

  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, 5500);
    return () => window.clearInterval(id);
  }, [total, paused]);

  if (!total) return null;

  const go = (dir: -1 | 1) => setActive((i) => (i + dir + total) % total);
  const current = offers[active]!;

  return (
    <section
      className="site-section bg-[#FFFBF5]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="site-container">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
              Offers
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Discounts &amp; Promotions
            </h2>
          </div>
          {total > 1 ? (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous offer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#F58220] hover:text-[#F58220]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next offer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#F58220] hover:text-[#F58220]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-lg sm:rounded-3xl">
          <div className="relative aspect-[16/10] sm:aspect-[21/8]">
            {offers.map((offer, index) => (
              <div
                key={offer.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-700",
                  index === active ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                aria-hidden={index !== active}
              >
                {offer.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
              </div>
            ))}

            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:justify-center sm:p-10 lg:p-12">
              <div className="max-w-xl">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#F58220] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {current.badge.toLowerCase().includes("%") ||
                  current.badge.toLowerCase().includes("off") ? (
                    <Percent className="h-3 w-3" />
                  ) : (
                    <Tag className="h-3 w-3" />
                  )}
                  {current.badge}
                </span>
                <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                  {current.headline}
                </h3>
                {current.subheadline ? (
                  <p className="mt-2 text-sm text-white/75 sm:text-base">
                    {current.subheadline}
                  </p>
                ) : null}
                <Link
                  href={current.href}
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#FFD200] px-6 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-[#F58220] hover:text-white"
                >
                  {current.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous offer"
                className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow sm:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next offer"
                className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow sm:hidden"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            {offers.map((offer, index) => (
              <button
                key={offer.id}
                type="button"
                aria-label={`Go to offer ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === active ? "w-6 bg-[#F58220]" : "w-2 bg-slate-300 hover:bg-slate-400"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
