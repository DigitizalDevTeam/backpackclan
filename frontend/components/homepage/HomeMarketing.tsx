"use client";

import { useEffect, useState } from "react";
import { HeroVideoBanner } from "@/components/homepage/HeroVideoBanner";
import { HomeCategoryNav } from "@/components/homepage/HomeCategoryNav";
import { HomePromoBanners } from "@/components/homepage/HomePromoBanners";
import { HomeCertifications } from "@/components/homepage/HomeCertifications";
import { CategorySection } from "@/components/homepage/CategorySection";
import { HomeReviewsSection } from "@/components/homepage/HomeReviewsSection";
import { HomeVideosSection } from "@/components/homepage/HomeVideosSection";
import { HomeInquiryCta } from "@/components/homepage/HomeInquiryCta";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  buildMarketingHomepageView,
  type MarketingHomepageView,
} from "@/lib/site/home-categories";
import type { HomepageSection } from "@/types/homepage";

export interface HomeMarketingProps {
  view?: MarketingHomepageView;
  fetchOnClient?: boolean;
}

export function HomeMarketing({ view: initialView, fetchOnClient = false }: HomeMarketingProps) {
  const [view, setView] = useState<MarketingHomepageView | null>(initialView ?? null);
  const [loading, setLoading] = useState(fetchOnClient && !initialView);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fetchOnClient) return;

    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/preview/homepage");
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.errors?.form ?? "Failed to load homepage preview");
          return;
        }

        const payload = data.data;
        const sections: HomepageSection[] = Array.isArray(payload)
          ? payload
          : (payload.sections ?? []);

        const mediaMap: Record<string, string> =
          payload.mediaMap ??
          Object.fromEntries(
            ((payload.media ?? []) as { id: string; url: string }[]).map((m) => [m.id, m.url])
          );

        setView(
          buildMarketingHomepageView(sections, mediaMap, {
            categories: Array.isArray(payload) ? [] : (payload.categories ?? []),
            offerBanners: Array.isArray(payload) ? [] : (payload.offerBanners ?? []),
            trips: Array.isArray(payload) ? [] : (payload.trips ?? []),
            destinations: Array.isArray(payload) ? [] : (payload.destinations ?? []),
          })
        );
      } catch {
        setError("Failed to load homepage preview");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fetchOnClient]);

  if (loading) {
    return (
      <div className="bg-white py-20">
        <LoadingSkeleton variant="cards" />
      </div>
    );
  }

  if (!view) {
    return (
      <div className="bg-white py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <p className="text-sm text-destructive">
            {error ?? "Homepage preview could not be loaded."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HeroVideoBanner hero={view.hero} />
      <HomeCategoryNav
        destinations={view.quickDestinations}
        categories={view.categories}
      />
      {view.categories.map((category, index) => (
        <div key={category.id}>
          <div id={category.slug}>
            <CategorySection
              category={category}
              index={index}
              internationalTrips={view.internationalTrips}
              mediaMap={view.mediaMap}
            />
          </div>
          {index === 1 && view.offers.length > 0 ? (
            <HomePromoBanners offers={view.offers} />
          ) : null}
        </div>
      ))}
      {view.accreditations ? (
        <HomeCertifications accreditations={view.accreditations} />
      ) : null}
      {view.reviews ? <HomeReviewsSection reviews={view.reviews} /> : null}
      {view.videos ? <HomeVideosSection videos={view.videos} /> : null}
      {view.inquiry ? <HomeInquiryCta inquiry={view.inquiry} /> : null}
    </div>
  );
}
