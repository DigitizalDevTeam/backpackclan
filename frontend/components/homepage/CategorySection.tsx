"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicTrip } from "@/types/trip";
import type { ResolvedCategory } from "@/lib/site/home-categories";
import { TripCard } from "@/components/homepage/homepage-parts";
import { cn } from "@/lib/utils";

function regionFromTabId(tabId: string): "domestic" | "international" | null {
  if (tabId === "international") return "international";
  if (tabId === "india" || tabId === "domestic") return "domestic";
  return null;
}

function withRegionParam(href: string, tabId: string): string {
  const region = regionFromTabId(tabId);
  if (!region || href.startsWith("/contact")) {
    if (region && href.startsWith("/contact")) {
      const [path, qs] = href.split("?");
      const params = new URLSearchParams(qs || "");
      params.set("region", region);
      return `${path}?${params.toString()}`;
    }
    return href;
  }

  const [path, qs] = href.split("?");
  const params = new URLSearchParams(qs || "");
  params.set("region", region);
  return `${path}?${params.toString()}`;
}

export function CategorySection({
  category,
  index,
  internationalTrips = [],
  mediaMap = {},
}: {
  category: ResolvedCategory;
  index: number;
  internationalTrips?: PublicTrip[];
  mediaMap?: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState(category.tabs[0]?.id ?? "");
  const tab = category.tabs.find((t) => t.id === activeTab) ?? category.tabs[0];
  const destinations = tab?.destinations ?? [];
  const lightBg = index % 2 === 1;
  const viewAllHref = withRegionParam(category.href, activeTab);

  return (
    <section
      id={index === 0 ? "categories" : undefined}
      className={cn("relative py-12 sm:py-16", lightBg ? "bg-[#FFFBF5]" : "bg-white")}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {category.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">{category.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {category.tabs.length > 1 ? (
              <div className="inline-flex rounded-full bg-slate-100 p-1">
                {category.tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:text-sm",
                      activeTab === t.id
                        ? "bg-[#FFD200] text-black shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#F58220]">
                {category.tabs[0]?.label ?? "Explore"}
              </span>
            )}
            <Link
              href={viewAllHref}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#FFD200] px-5 text-xs font-bold uppercase tracking-wide text-black transition hover:bg-[#F58220] hover:text-white"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative mb-5 overflow-hidden rounded-2xl sm:mb-6 sm:rounded-3xl">
          <div className="relative aspect-[2/1] sm:aspect-[3/1]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={category.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {category.videoSrc ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={category.poster}
                aria-label={`${category.title} video`}
              >
                <source src={category.videoSrc} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-6">
              <p className="font-display text-xl font-semibold text-white sm:text-3xl">
                {category.title}
              </p>
              <p className="mt-1 max-w-md text-xs text-white/75 sm:text-sm">
                {category.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-4">
          {destinations.map((d) => (
            <Link
              key={`${d.name}-${d.href}`}
              href={d.href}
              className="group w-[70vw] shrink-0 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-full sm:shrink"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-display text-lg font-semibold text-white">{d.name}</p>
                  {typeof d.trips === "number" ? (
                    <p className="mt-0.5 text-xs text-white/70">{d.trips} trips available</p>
                  ) : null}
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#FFD200] opacity-0 transition-opacity group-hover:opacity-100">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {activeTab === "international" && internationalTrips.length > 0 ? (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                International departures
              </h3>
              <Link
                href="/trips?region=international"
                className="text-xs font-semibold text-[#F58220] hover:underline"
              >
                View all international trips
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {internationalTrips.slice(0, 4).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  imageUrl={mediaMap[trip.imageId] ?? null}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
