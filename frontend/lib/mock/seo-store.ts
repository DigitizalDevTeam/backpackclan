import type { RobotsDirective, SeoMeta, SeoPageDefinition } from "@/types/seo";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

export const SEO_PAGES: SeoPageDefinition[] = [
  { pageKey: "homepage", label: "Homepage", path: "/" },
  { pageKey: "about", label: "About Us", path: "/about" },
  { pageKey: "contact", label: "Contact", path: "/contact" },
  { pageKey: "blog", label: "Blog Index", path: "/blog" },
  {
    pageKey: "trips",
    label: "Trip Listing",
    path: "/trips",
    isPlaceholder: true,
  },
  {
    pageKey: "destinations",
    label: "Destinations",
    path: "/destinations",
    isPlaceholder: true,
  },
];

const DEFAULTS: Record<string, Omit<SeoMeta, "id" | "updatedAt">> = {
  homepage: {
    pageKey: "homepage",
    metaTitle: "Backpackclan — Adventure Tours in Ladakh, Spiti & Himalayas",
    metaDescription:
      "Book curated bike tours, treks, and group trips across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal. Guaranteed departures & expert guides.",
    ogImageId: "1",
    canonicalUrl: "https://backpackclan.com/",
    robots: "index, follow",
    schemaJson: JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        name: "Backpackclan",
        url: "https://backpackclan.com",
        description: "Adventure travel tours across the Himalayas",
      },
      null,
      2
    ),
  },
  about: {
    pageKey: "about",
    metaTitle: "About Backpackclan — Your Himalayan Adventure Partner",
    metaDescription:
      "Learn about Backpackclan, our story, expert guides, and why thousands of travelers trust us for unforgettable Himalayan adventures.",
    ogImageId: "2",
    canonicalUrl: "https://backpackclan.com/about",
    robots: "index, follow",
    schemaJson: "",
  },
  contact: {
    pageKey: "contact",
    metaTitle: "Contact Backpackclan — Plan Your Next Adventure",
    metaDescription:
      "Get in touch with Backpackclan for trip inquiries, custom tours, corporate bookings, and travel support. We're here to help.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/contact",
    robots: "index, follow",
    schemaJson: "",
  },
  blog: {
    pageKey: "blog",
    metaTitle: "Travel Blog — Tips, Guides & Stories | Backpackclan",
    metaDescription:
      "Read travel guides, destination tips, and adventure stories from the Backpackclan team. Plan smarter for your next Himalayan trip.",
    ogImageId: "5",
    canonicalUrl: "https://backpackclan.com/blog",
    robots: "index, follow",
    schemaJson: "",
  },
  trips: {
    pageKey: "trips",
    metaTitle: "All Trips — Bike Tours, Treks & Group Adventures | Backpackclan",
    metaDescription:
      "Browse all Backpackclan trips. Filter by destination, budget, duration, and departure date. Find your perfect Himalayan adventure.",
    ogImageId: "1",
    canonicalUrl: "https://backpackclan.com/trips",
    robots: "index, follow",
    schemaJson: "",
  },
  destinations: {
    pageKey: "destinations",
    metaTitle: "Destinations — Ladakh, Spiti, Kashmir & More | Backpackclan",
    metaDescription:
      "Explore Backpackclan destinations including Leh Ladakh, Spiti Valley, Kashmir, Bhutan, and Nepal. Find packages, FAQs, and best time to visit.",
    ogImageId: "3",
    canonicalUrl: "https://backpackclan.com/destinations",
    robots: "index, follow",
    schemaJson: "",
  },
};

function buildSeed(): SeoMeta[] {
  const now = new Date().toISOString();
  return SEO_PAGES.map((page, index) => {
    const defaults = DEFAULTS[page.pageKey];
    return {
      id: String(index + 1),
      ...defaults,
      updatedAt: now,
    };
  });
}

const seoStore = createPersistedStore("seo", buildSeed());

export function getAllSeoMeta(): SeoMeta[] {
  return seoStore.get().map((item) => ({ ...item }));
}

export function getSeoByPageKey(pageKey: string): SeoMeta | null {
  return seoStore.get().find((s) => s.pageKey === pageKey) ?? null;
}

export function getSeoPageDefinition(pageKey: string): SeoPageDefinition | null {
  return SEO_PAGES.find((p) => p.pageKey === pageKey) ?? null;
}

export function updateSeoMeta(
  pageKey: string,
  data: {
    metaTitle: string;
    metaDescription: string;
    ogImageId: string | null;
    canonicalUrl: string;
    robots: RobotsDirective;
    schemaJson: string;
  }
): SeoMeta {
  const index = seoStore.get().findIndex((s) => s.pageKey === pageKey);
  if (index === -1) throw new Error("SEO page not found");

  const updated: SeoMeta = {
    ...seoStore.get()[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const items = seoStore.get();
  seoStore.set([...items.slice(0, index), updated, ...items.slice(index + 1)]);
  const page = SEO_PAGES.find((p) => p.pageKey === pageKey);
  logActivity(`SEO meta updated for ${page?.label ?? pageKey}`, "seo");
  return updated;
}

export function resetSeoMeta(pageKey: string): SeoMeta {
  const defaults = DEFAULTS[pageKey];
  if (!defaults) throw new Error("SEO page not found");

  const items = seoStore.get();
  const index = items.findIndex((s) => s.pageKey === pageKey);
  if (index === -1) throw new Error("SEO page not found");

  const reset: SeoMeta = {
    id: items[index].id,
    ...defaults,
    updatedAt: new Date().toISOString(),
  };

  seoStore.set([...items.slice(0, index), reset, ...items.slice(index + 1)]);
  return reset;
}
