import type { RobotsDirective, SeoMeta, SeoPageDefinition } from "@/types/seo";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

export const SEO_PAGES: SeoPageDefinition[] = [
  { pageKey: "homepage", label: "Homepage", path: "/" },
  { pageKey: "about", label: "About Us", path: "/about" },
  { pageKey: "contact", label: "Contact", path: "/contact" },
  { pageKey: "blog", label: "Blog Index", path: "/blog" },
  { pageKey: "trips", label: "Trip Listing", path: "/trips" },
  { pageKey: "destinations", label: "Destinations", path: "/destinations" },
  { pageKey: "privacy", label: "Privacy Policy", path: "/privacy" },
  { pageKey: "terms", label: "Terms & Conditions", path: "/terms" },
  { pageKey: "request_callback", label: "Request Callback", path: "/request-callback" },
  { pageKey: "inquire_custom_trip", label: "Custom Trip Inquiry", path: "/inquire/custom-trip" },
  { pageKey: "inquire_corporate", label: "Corporate Trips", path: "/inquire/corporate" },
  { pageKey: "partners_register", label: "Partner Registration", path: "/partners/register" },
  { pageKey: "careers_apply", label: "Careers", path: "/careers/apply" },
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
      "Get in touch with Backpackclan for trip inquiries, custom tours, corporate bookings, and travel support.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/contact",
    robots: "index, follow",
    schemaJson: "",
  },
  blog: {
    pageKey: "blog",
    metaTitle: "Travel Blog — Tips, Guides & Stories | Backpackclan",
    metaDescription:
      "Read travel guides, destination tips, and adventure stories from the Backpackclan team.",
    ogImageId: "5",
    canonicalUrl: "https://backpackclan.com/blog",
    robots: "index, follow",
    schemaJson: "",
  },
  trips: {
    pageKey: "trips",
    metaTitle: "All Trips — Bike Tours, Treks & Group Adventures | Backpackclan",
    metaDescription:
      "Browse all Backpackclan trips. Filter by destination, budget, duration, and departure date.",
    ogImageId: "1",
    canonicalUrl: "https://backpackclan.com/trips",
    robots: "index, follow",
    schemaJson: "",
  },
  destinations: {
    pageKey: "destinations",
    metaTitle: "Destinations — Ladakh, Spiti, Kashmir & More | Backpackclan",
    metaDescription:
      "Explore Backpackclan destinations including Leh Ladakh, Spiti Valley, Kashmir, Bhutan, and Nepal.",
    ogImageId: "3",
    canonicalUrl: "https://backpackclan.com/destinations",
    robots: "index, follow",
    schemaJson: "",
  },
  privacy: {
    pageKey: "privacy",
    metaTitle: "Privacy Policy — Backpackclan",
    metaDescription: "How Backpackclan collects, uses, and protects your personal information.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/privacy",
    robots: "index, follow",
    schemaJson: "",
  },
  terms: {
    pageKey: "terms",
    metaTitle: "Terms & Conditions — Backpackclan",
    metaDescription: "Terms and conditions for booking trips and using Backpackclan services.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/terms",
    robots: "index, follow",
    schemaJson: "",
  },
  request_callback: {
    pageKey: "request_callback",
    metaTitle: "Request a Callback — Backpackclan",
    metaDescription: "Request a phone callback from the Backpackclan travel team.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/request-callback",
    robots: "index, follow",
    schemaJson: "",
  },
  inquire_custom_trip: {
    pageKey: "inquire_custom_trip",
    metaTitle: "Plan a Custom Trip — Backpackclan",
    metaDescription:
      "Tell us your dates, group size, and destination — we will craft a private Himalayan itinerary.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/inquire/custom-trip",
    robots: "index, follow",
    schemaJson: "",
  },
  inquire_corporate: {
    pageKey: "inquire_corporate",
    metaTitle: "Corporate & Team Offsites — Backpackclan",
    metaDescription:
      "Curated corporate retreats, team offsites, and incentive trips across India and the Himalayas.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/inquire/corporate",
    robots: "index, follow",
    schemaJson: "",
  },
  partners_register: {
    pageKey: "partners_register",
    metaTitle: "Partner With Backpackclan",
    metaDescription: "Register as a travel partner, influencer, or affiliate with Backpackclan.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/partners/register",
    robots: "index, follow",
    schemaJson: "",
  },
  careers_apply: {
    pageKey: "careers_apply",
    metaTitle: "Careers at Backpackclan",
    metaDescription:
      "Join the Backpackclan team — operations, content, sales, and on-ground trip leaders.",
    ogImageId: null,
    canonicalUrl: "https://backpackclan.com/careers/apply",
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
