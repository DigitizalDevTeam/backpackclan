import { z } from "zod";

const publishStatusEnum = z.enum(["draft", "published", "archived"]);

const highlightSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  text: z.string(),
});

const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

const weatherMonthSchema = z.object({
  month: z.number().min(1).max(12),
  avgHigh: z.number().nullable(),
  avgLow: z.number().nullable(),
  conditions: z.string(),
  note: z.string(),
});

const nullableNumber = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}, z.number().nullable());

export const destinationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  country: z.string().min(1, "Country is required"),
  region: z.string().min(1, "Region is required"),
  tagline: z.string(),
  heroImageId: z.string().nullable(),
  isFeatured: z.boolean(),
  sortOrder: z.coerce.number().min(0),
  status: publishStatusEnum,
  overview: z.object({
    content: z.string(),
    highlights: z.array(highlightSchema),
    gallery: z.array(z.string()),
  }),
  banner: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string(),
    ctaUrl: z.string(),
    mediaId: z.string().nullable(),
  }),
  linkedTripIds: z.array(z.string()),
  faqs: z.array(faqSchema),
  bestTime: z.object({
    content: z.string(),
    recommendedMonths: z.array(z.number().min(1).max(12)),
  }),
  weather: z.array(weatherMonthSchema),
  map: z.object({
    embedUrl: z.string(),
    latitude: nullableNumber,
    longitude: nullableNumber,
  }),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImageId: z.string().nullable(),
    canonicalUrl: z.string(),
    robots: z.string(),
  }),
});

export type DestinationFormValues = z.infer<typeof destinationFormSchema>;

export const DESTINATION_TABS = [
  { id: "basics", label: "Basics" },
  { id: "banner", label: "Banner" },
  { id: "overview", label: "Overview" },
  { id: "packages", label: "Packages" },
  { id: "faqs", label: "FAQs" },
  { id: "bestTime", label: "Best Time" },
  { id: "weather", label: "Weather" },
  { id: "map", label: "Map" },
  { id: "seo", label: "SEO" },
] as const;

export type DestinationTabId = (typeof DESTINATION_TABS)[number]["id"];

export const DESTINATION_TAB_FIELD_RULES: {
  prefix: string;
  tab: DestinationTabId;
}[] = [
  { prefix: "banner", tab: "banner" },
  { prefix: "overview", tab: "overview" },
  { prefix: "linkedTripIds", tab: "packages" },
  { prefix: "faqs", tab: "faqs" },
  { prefix: "bestTime", tab: "bestTime" },
  { prefix: "weather", tab: "weather" },
  { prefix: "map", tab: "map" },
  { prefix: "seo", tab: "seo" },
];

export const DESTINATION_TAB_LABELS = Object.fromEntries(
  DESTINATION_TABS.map((tab) => [tab.id, tab.label])
) as Record<DestinationTabId, string>;

export function defaultDestinationFormValues(): DestinationFormValues {
  return {
    name: "",
    slug: "",
    country: "India",
    region: "",
    tagline: "",
    heroImageId: null,
    isFeatured: false,
    sortOrder: 0,
    status: "draft",
    overview: { content: "", highlights: [], gallery: [] },
    banner: {
      headline: "",
      subheadline: "",
      ctaLabel: "",
      ctaUrl: "",
      mediaId: null,
    },
    linkedTripIds: [],
    faqs: [],
    bestTime: { content: "", recommendedMonths: [] },
    weather: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      avgHigh: null,
      avgLow: null,
      conditions: "",
      note: "",
    })),
    map: { embedUrl: "", latitude: null, longitude: null },
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImageId: null,
      canonicalUrl: "",
      robots: "index, follow",
    },
  };
}
