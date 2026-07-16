import { z } from "zod";

const publishStatusEnum = z.enum(["draft", "published", "archived"]);
const tripTypeEnum = z.enum(["bike", "trek", "road_trip", "custom", "mixed"]);
const difficultyEnum = z.enum(["easy", "moderate", "challenging", "expert"]);

const repeaterItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  icon: z.string().optional(),
});

const itineraryDaySchema = z.object({
  id: z.string(),
  dayNumber: z.number(),
  title: z.string(),
  description: z.string(),
  meals: z.object({
    breakfast: z.boolean(),
    lunch: z.boolean(),
    dinner: z.boolean(),
  }),
  overnight: z.string(),
  distance: z.string().optional(),
  altitude: z.string().optional(),
});

const faqSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

const testimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  tripTaken: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  avatarId: z.string().nullable(),
});

const pricingSchema = z.object({
  basePrice: z.number().min(0),
  salePrice: z.number().nullable().optional(),
  showStrikeThrough: z.boolean(),
  offerLabel: z.string().optional(),
  offerValidUntil: z.string().nullable().optional(),
  currency: z.literal("INR"),
  pricePer: z.enum(["person", "bike", "couple"]),
});

export const adminTripFormSchema = z.object({
  destinationId: z.string().min(1, "Destination is required"),
  categoryIds: z.array(z.string()),
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  tripType: tripTypeEnum,
  durationDays: z.coerce.number().min(1, "Days must be at least 1"),
  durationNights: z.coerce.number().min(0, "Nights cannot be negative"),
  difficulty: difficultyEnum,
  maxGroupSize: z.coerce.number().min(1, "Max group size must be at least 1"),
  minAge: z.union([z.coerce.number().min(0), z.null()]),
  maxAltitude: z.string().nullable().optional(),
  summary: z.string().min(1, "Summary is required"),
  coverImageId: z.string().nullable(),
  gallery: z.array(z.string()),
  overview: z.object({
    content: z.string(),
    highlights: z.array(repeaterItemSchema),
    routeMapEmbed: z.string(),
    routeMapImageId: z.string().nullable(),
  }),
  itinerary: z.array(itineraryDaySchema),
  inclusions: z.array(repeaterItemSchema),
  exclusions: z.array(repeaterItemSchema),
  thingsToCarry: z.array(repeaterItemSchema),
  cancellationPolicy: z.array(repeaterItemSchema),
  refundPolicy: z.array(repeaterItemSchema),
  faqs: z.array(faqSchema),
  testimonials: z.array(testimonialSchema),
  pricing: pricingSchema,
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    ogImageId: z.string().nullable(),
    canonicalUrl: z.string(),
    robots: z.string(),
  }),
  isFeatured: z.boolean(),
  status: publishStatusEnum,
  sortOrder: z.coerce.number().min(0),
});

export type AdminTripFormValues = z.infer<typeof adminTripFormSchema>;

export const TRIP_TABS = [
  { id: "basics", label: "Basics" },
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "policies", label: "Policies" },
  { id: "faqs", label: "FAQs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "pricing", label: "Pricing" },
  { id: "seo", label: "SEO & Publish" },
] as const;

export type TripTabId = (typeof TRIP_TABS)[number]["id"];

export const TRIP_TAB_FIELD_RULES: { prefix: string; tab: TripTabId }[] = [
  { prefix: "overview", tab: "overview" },
  { prefix: "itinerary", tab: "itinerary" },
  { prefix: "inclusions", tab: "inclusions" },
  { prefix: "exclusions", tab: "inclusions" },
  { prefix: "thingsToCarry", tab: "inclusions" },
  { prefix: "cancellationPolicy", tab: "policies" },
  { prefix: "refundPolicy", tab: "policies" },
  { prefix: "faqs", tab: "faqs" },
  { prefix: "testimonials", tab: "testimonials" },
  { prefix: "pricing", tab: "pricing" },
  { prefix: "seo", tab: "seo" },
];

export const TRIP_TAB_LABELS = Object.fromEntries(
  TRIP_TABS.map((tab) => [tab.id, tab.label])
) as Record<TripTabId, string>;

export function defaultAdminTripFormValues(): AdminTripFormValues {
  return {
    destinationId: "",
    categoryIds: [],
    title: "",
    slug: "",
    tripType: "bike",
    durationDays: 1,
    durationNights: 0,
    difficulty: "moderate",
    maxGroupSize: 15,
    minAge: null,
    maxAltitude: null,
    summary: "",
    coverImageId: null,
    gallery: [],
    overview: {
      content: "",
      highlights: [],
      routeMapEmbed: "",
      routeMapImageId: null,
    },
    itinerary: [],
    inclusions: [],
    exclusions: [],
    thingsToCarry: [],
    cancellationPolicy: [],
    refundPolicy: [],
    faqs: [],
    testimonials: [],
    pricing: {
      basePrice: 0,
      salePrice: null,
      showStrikeThrough: false,
      offerLabel: "",
      offerValidUntil: null,
      currency: "INR",
      pricePer: "person",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImageId: null,
      canonicalUrl: "",
      robots: "index, follow",
    },
    isFeatured: false,
    status: "draft",
    sortOrder: 0,
  };
}

export const publishTripSchema = adminTripFormSchema.extend({
  coverImageId: z.string().min(1, "Cover image is required for publishing"),
});
