import type { FaqItem, PublishStatus, WeatherMonth } from "@/types/travel";

export interface DestinationHighlight {
  id: string;
  icon?: string;
  text: string;
}

export interface DestinationBanner {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaUrl: string;
  mediaId: string | null;
}

export interface DestinationOverview {
  content: string;
  highlights: DestinationHighlight[];
  gallery: string[];
}

export interface DestinationBestTime {
  content: string;
  recommendedMonths: number[];
}

export interface DestinationMap {
  embedUrl: string;
  latitude: number | null;
  longitude: number | null;
}

export interface DestinationSeo {
  metaTitle: string;
  metaDescription: string;
  ogImageId: string | null;
  canonicalUrl: string;
  robots: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  country: string;
  region: string;
  tagline: string;
  heroImageId: string | null;
  overview: DestinationOverview;
  banner: DestinationBanner;
  linkedTripIds: string[];
  faqs: FaqItem[];
  bestTime: DestinationBestTime;
  weather: WeatherMonth[];
  map: DestinationMap;
  seo: DestinationSeo;
  isFeatured: boolean;
  sortOrder: number;
  status: PublishStatus;
  tripCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DestinationInput = Omit<
  Destination,
  "id" | "createdAt" | "updatedAt" | "tripCount"
>;

export const DESTINATION_STATUS_LABELS: Record<PublishStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};
