"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { PublicTrip } from "@/types/trip";
import {
  categorySupportsMonthWise,
  type ResolvedCategory,
} from "@/lib/site/home-categories";
import { TripCard } from "@/components/homepage/homepage-parts";
import { cn } from "@/lib/utils";

const MONTH_PILLS = [
  { key: "jan", label: "Jan" },
  { key: "feb", label: "Feb" },
  { key: "mar", label: "Mar" },
  { key: "apr", label: "Apr" },
  { key: "may", label: "May" },
  { key: "jun", label: "Jun" },
  { key: "jul", label: "Jul" },
  { key: "aug", label: "Aug" },
  { key: "sep", label: "Sep" },
  { key: "oct", label: "Oct" },
  { key: "nov", label: "Nov" },
  { key: "dec", label: "Dec" },
] as const;

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

function categoryParamFromHref(href: string, slug: string): string {
  try {
    const url = new URL(href, "https://backpackclan.local");
    return url.searchParams.get("category") ?? slug;
  } catch {
    return slug;
  }
}

export function CategorySection({
  category,
  index,
  internationalTrips = [],
  domesticTrips = [],
  mediaMap = {},
}: {
  category: ResolvedCategory;
  index: number;
  internationalTrips?: PublicTrip[];
  domesticTrips?: PublicTrip[];
  mediaMap?: Record<string, string>;
}) {
  const showMonthWise = categorySupportsMonthWise(category.slug, category.title);
  const tabs = useMemo(
    () =>
      showMonthWise
        ? category.tabs
        : category.tabs.filter((t) => t.id !== "months"),
    [category.tabs, showMonthWise]
  );

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");
  const tab = tabs.find((t) => t.id === activeTab) ?? tabs[0];
  const destinations = tab?.destinations ?? [];
  const tabTrips = useMemo(() => tab?.trips ?? [], [tab]);
  const showcaseType = tab?.showcaseType ?? "destinations";
  const isMonthTab = tab?.id === "months";
  const lightBg = index % 2 === 1;
  const displayTitle = tab?.title?.trim() || category.title;
  const displaySubtitle = tab?.subtitle?.trim() || category.subtitle;
  const viewAllBase = tab?.href?.trim() || category.href;
  const viewAllHref = withRegionParam(viewAllBase, activeTab);
  const categoryParam = categoryParamFromHref(viewAllBase, category.slug);
  const region = regionFromTabId(activeTab);
  const bannerPoster = tab?.poster || category.poster;
  const bannerVideo = tab?.videoSrc || category.videoSrc;

  const departureTrips = useMemo(() => {
    if (showcaseType === "destinations" && tabTrips.length > 0) {
      return tabTrips.slice(0, 4);
    }

    const pool =
      region === "international"
        ? internationalTrips
        : region === "domestic"
          ? domesticTrips
          : [];
    if (!pool.length) return [];

    const slug = category.slug.toLowerCase();
    const title = category.title.toLowerCase();
    const matched = pool.filter((t) => {
      const cat = (t.category ?? "").toLowerCase();
      return (
        cat.includes(slug.replace(/-/g, " ")) ||
        slug.includes(cat.replace(/\s+/g, "-")) ||
        title.includes(cat) ||
        cat.includes(title.split(" ")[0] ?? "")
      );
    });

    return (matched.length > 0 ? matched : pool).slice(0, 4);
  }, [
    showcaseType,
    tabTrips,
    region,
    internationalTrips,
    domesticTrips,
    category.slug,
    category.title,
  ]);

  const departureLabel =
    region === "international" ? "International departures" : "Domestic departures";
  const departureViewAllHref =
    region === "international"
      ? `/trips?region=international&category=${encodeURIComponent(categoryParam)}`
      : `/trips?region=domestic&category=${encodeURIComponent(categoryParam)}`;
  const departureViewAllLabel =
    region === "international"
      ? "View all international trips"
      : "View all domestic trips";

  return (
    <section
      id={index === 0 ? "categories" : undefined}
      className={cn("relative site-section", lightBg ? "bg-[#FFFBF5]" : "bg-white")}
    >
      <div className="site-container">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {displayTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">{displaySubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {tabs.length > 1 ? (
              <div className="inline-flex flex-wrap rounded-full bg-slate-100 p-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition sm:text-sm",
                      activeTab === t.id
                        ? "bg-[#FFD200] text-black shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t.id === "months" ? <CalendarDays className="h-3.5 w-3.5" /> : null}
                    {t.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#F58220]">
                {tabs[0]?.label ?? "Explore"}
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

        <div className="relative mb-2 overflow-hidden rounded-xl sm:mb-3 sm:rounded-2xl">
          <div className="relative aspect-[2/1] sm:aspect-[21/6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerPoster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            {bannerVideo ? (
              <video
                key={bannerVideo}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={bannerPoster}
                aria-label={`${displayTitle} video`}
              >
                <source src={bannerVideo} type="video/mp4" />
              </video>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 sm:p-6">
              <p className="font-display text-xl font-semibold text-white sm:text-3xl">
                {displayTitle}
              </p>
              <p className="mt-1 max-w-md text-xs text-white/75 sm:text-sm">
                {displaySubtitle}
              </p>
            </div>
          </div>
        </div>

        {isMonthTab ? (
          <div className="mb-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Pick a month
            </p>
            <div className="scrollbar-hide -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
              {MONTH_PILLS.map((m) => (
                <Link
                  key={m.key}
                  href={`/trips?category=${encodeURIComponent(categoryParam)}&month=${m.key}`}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-[#F58220] hover:bg-[#FFF7ED] hover:text-[#F58220]"
                >
                  {m.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {showcaseType === "trips" && tabTrips.length > 0 ? (
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tabTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                imageUrl={mediaMap[trip.imageId] ?? null}
              />
            ))}
          </div>
        ) : (
          <div className="scrollbar-hide -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 md:grid-cols-5">
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
                    {isMonthTab ? (
                      <p className="mt-0.5 text-xs text-white/70">Season departures</p>
                    ) : typeof d.trips === "number" ? (
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
        )}

        {departureTrips.length > 0 ? (
          <div className="mt-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                {departureLabel}
              </h3>
              <Link
                href={departureViewAllHref}
                className="text-xs font-semibold text-[#F58220] hover:underline"
              >
                {departureViewAllLabel}
              </Link>
            </div>
            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {departureTrips.map((trip) => (
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
