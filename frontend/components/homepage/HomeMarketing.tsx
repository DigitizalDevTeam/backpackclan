"use client";

import { useEffect, useState } from "react";
import { HeroVideoBanner } from "@/components/homepage/HeroVideoBanner";
import { HomeCategoryNav } from "@/components/homepage/HomeCategoryNav";
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

  useEffect(() => {
    if (!fetchOnClient) return;

    async function load() {
      try {
        const res = await fetch("/api/preview/homepage");
        const data = await res.json();
        if (!data.success) return;

        const payload = data.data;
        const sections: HomepageSection[] = Array.isArray(payload)
          ? payload
          : (payload.sections ?? []);

        let mediaMap: Record<string, string> = {};
        const mediaRes = await fetch("/api/admin/media");
        const mediaData = await mediaRes.json();
        if (mediaData.success) {
          mediaMap = Object.fromEntries(
            mediaData.data.map((m: { id: string; url: string }) => [m.id, m.url])
          );
        }

        setView(buildMarketingHomepageView(sections, mediaMap));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [fetchOnClient]);

  if (loading || !view) {
    return (
      <div className="bg-white py-20">
        <LoadingSkeleton variant="cards" />
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
        <div key={category.id} id={category.slug}>
          <CategorySection category={category} index={index} />
        </div>
      ))}
      {view.reviews ? <HomeReviewsSection reviews={view.reviews} /> : null}
      {view.videos ? <HomeVideosSection videos={view.videos} /> : null}
      {view.inquiry ? <HomeInquiryCta inquiry={view.inquiry} /> : null}
    </div>
  );
}
