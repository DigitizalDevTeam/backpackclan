import type { AdminTrip, AdminTripInput } from "@/types/admin-trip";
import type { PublicTrip, TripRegion } from "@/types/trip";
import { getCategoryById } from "@/lib/mock/category-store";
import { getDestinationById } from "@/lib/mock/destination-store";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";
import { slugify } from "@/lib/utils/slug";
import { isSaleActive, resolvePricing } from "@/lib/pricing/utils";

function generateId(): string {
  return `t${Date.now()}`.replace(".", "");
}

function itemId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function seedTrip(
  partial: Omit<
    AdminTripInput,
    "maxAltitude" | "thingsToCarry" | "cancellationPolicy" | "refundPolicy"
  > &
    Partial<
      Pick<
        AdminTripInput,
        "maxAltitude" | "thingsToCarry" | "cancellationPolicy" | "refundPolicy"
      >
    >,
  id: string,
  departuresCount = 0
): AdminTrip {
  const now = "2026-02-15T10:00:00.000Z";
  return {
    id,
    departuresCount,
    maxAltitude: null,
    thingsToCarry: [],
    cancellationPolicy: [],
    refundPolicy: [],
    ...partial,
    createdAt: now,
    updatedAt: now,
  };
}

const SEED_ADMIN_TRIPS: AdminTrip[] = [
  seedTrip(
    {
      destinationId: "1",
      categoryIds: ["1"],
      title: "11 Days Ladakh Bike Expedition",
      slug: "leh-ladakh-bike-expedition",
      tripType: "bike",
      durationDays: 11,
      durationNights: 10,
      difficulty: "challenging",
      maxGroupSize: 12,
      minAge: 18,
      summary:
        "Epic motorcycle journey across Khardung La, Nubra Valley, and Pangong Lake on Royal Enfield 350cc bikes.",
      coverImageId: "1",
      gallery: ["1", "2", "7"],
      overview: {
        content:
          "<p>Experience the ultimate Himalayan bike adventure from Manali to Leh and beyond. Ride through high-altitude passes, camp under starlit skies, and explore ancient monasteries.</p>",
        highlights: [
          { id: "h1", text: "Ride over Khardung La — world's highest motorable pass" },
          { id: "h2", text: "Royal Enfield 350cc with mechanic support" },
          { id: "h3", text: "Pangong Lake & Nubra Valley" },
        ],
        routeMapEmbed: "",
        routeMapImageId: "2",
      },
      itinerary: [
        {
          id: "d1",
          dayNumber: 1,
          title: "Manali to Jispa",
          description: "<p>Begin the ascent through Rohtang Pass into Lahaul valley.</p>",
          meals: { breakfast: true, lunch: true, dinner: true },
          overnight: "Jispa",
          distance: "140 km",
        },
        {
          id: "d2",
          dayNumber: 2,
          title: "Jispa to Sarchu",
          description: "<p>Cross Baralacha La and enter the high-altitude plateau.</p>",
          meals: { breakfast: true, lunch: true, dinner: true },
          overnight: "Sarchu camps",
          altitude: "4,290m",
        },
      ],
      inclusions: [
        { id: "i1", text: "Bike rental (Royal Enfield 350cc)" },
        { id: "i2", text: "Fuel for the entire route" },
        { id: "i3", text: "Accommodation on twin sharing" },
        { id: "i4", text: "All meals on riding days" },
        { id: "i5", text: "Inner line permits" },
      ],
      exclusions: [
        { id: "e1", text: "Personal expenses" },
        { id: "e2", text: "Travel insurance" },
        { id: "e3", text: "Damage to bike beyond normal wear" },
      ],
      maxAltitude: "5,359m (Khardung La)",
      thingsToCarry: [
        { id: "tc1", text: "Riding jacket and gloves" },
        { id: "tc2", text: "Warm layers for high passes" },
      ],
      cancellationPolicy: [
        { id: "cp1", text: "30+ days before departure: Full refund minus processing fee" },
        { id: "cp2", text: "Less than 15 days: No refund" },
      ],
      refundPolicy: [
        { id: "rp1", text: "Refunds processed within 7–10 business days" },
      ],
      faqs: [
        {
          id: "f1",
          question: "Do I need a bike license?",
          answer: "<p>Yes, a valid motorcycle license is mandatory for all riders.</p>",
        },
      ],
      testimonials: [
        {
          id: "t1",
          name: "Rahul Sharma",
          tripTaken: "Ladakh Bike 2025",
          rating: 5,
          text: "Best bike trip of my life. The team handled everything perfectly.",
          avatarId: null,
        },
      ],
      pricing: {
        basePrice: 29999,
        salePrice: 24999,
        showStrikeThrough: true,
        offerLabel: "Early Bird 15% Off",
        offerValidUntil: "2026-09-30T23:59:59.000Z",
        currency: "INR",
        pricePer: "person",
      },
      seo: {
        metaTitle: "Ladakh Bike Expedition 11 Days | Backpackclan",
        metaDescription: "Book the ultimate Ladakh motorcycle tour — Manali to Leh, Nubra, Pangong.",
        ogImageId: "1",
        canonicalUrl: "https://backpackclan.com/trips/leh-ladakh-bike-expedition",
        robots: "index, follow",
      },
      isFeatured: true,
      status: "published",
      sortOrder: 0,
    },
    "t1",
    4
  ),
  seedTrip(
    {
      destinationId: "2",
      categoryIds: ["3"],
      title: "Spiti Valley Circuit — Chandratal Edition",
      slug: "spiti-valley-road-trip",
      tripType: "road_trip",
      durationDays: 7,
      durationNights: 6,
      difficulty: "moderate",
      maxGroupSize: 18,
      minAge: null,
      summary: "7-day road trip through Spiti's middle land — monasteries, Chandratal Lake, and high passes.",
      coverImageId: "2",
      gallery: ["2", "5"],
      overview: {
        content: "<p>Traverse the dramatic Spiti Valley on a curated road trip with experienced drivers and comfortable stays.</p>",
        highlights: [{ id: "h1", text: "Key Monastery & Tabo" }],
        routeMapEmbed: "",
        routeMapImageId: null,
      },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Tempo traveller / SUV transport" }],
      exclusions: [{ id: "e1", text: "Flights to Chandigarh" }],
      faqs: [],
      testimonials: [],
      pricing: {
        basePrice: 21999,
        salePrice: 18999,
        showStrikeThrough: true,
        currency: "INR",
        pricePer: "person",
      },
      seo: {
        metaTitle: "Spiti Valley Road Trip | Backpackclan",
        metaDescription: "7-day Spiti Valley circuit with Chandratal Lake.",
        ogImageId: "2",
        canonicalUrl: "https://backpackclan.com/trips/spiti-valley-road-trip",
        robots: "index, follow",
      },
      isFeatured: true,
      status: "published",
      sortOrder: 1,
    },
    "t2",
    3
  ),
  seedTrip(
    {
      destinationId: "3",
      categoryIds: ["2"],
      title: "Kashmir Great Lakes Trek",
      slug: "kashmir-great-lakes-trek",
      tripType: "trek",
      durationDays: 7,
      durationNights: 6,
      difficulty: "challenging",
      maxGroupSize: 12,
      minAge: 16,
      summary: "Alpine trek through seven pristine high-altitude lakes in Kashmir.",
      coverImageId: "3",
      gallery: ["3"],
      overview: { content: "<p>A bucket-list trek through Kashmir's stunning alpine meadows.</p>", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Camping equipment" }, { id: "i2", text: "Trek guide & support staff" }],
      exclusions: [{ id: "e1", text: "Personal trekking gear" }],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 15999, showStrikeThrough: false, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Kashmir Great Lakes Trek | Backpackclan",
        metaDescription: "Guided Kashmir Great Lakes trek — 6 nights alpine adventure.",
        ogImageId: "3",
        canonicalUrl: "https://backpackclan.com/trips/kashmir-great-lakes-trek",
        robots: "index, follow",
      },
      isFeatured: true,
      status: "published",
      sortOrder: 2,
    },
    "t3",
    2
  ),
  seedTrip(
    {
      destinationId: "4",
      categoryIds: ["3"],
      title: "Bhutan Cultural Trail",
      slug: "bhutan-cultural-trail",
      tripType: "mixed",
      durationDays: 6,
      durationNights: 5,
      difficulty: "easy",
      maxGroupSize: 16,
      minAge: null,
      summary: "Discover Bhutan's dzongs, monasteries, and happiness philosophy on a guided cultural tour.",
      coverImageId: "4",
      gallery: ["4"],
      overview: { content: "<p>Immerse in Bhutanese culture from Thimphu to Paro including Tiger's Nest.</p>", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Bhutan visa processing" }],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 35999, salePrice: 32999, showStrikeThrough: true, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Bhutan Cultural Trail | Backpackclan",
        metaDescription: "6-day Bhutan cultural tour — Thimphu, Punakha, Paro.",
        ogImageId: "4",
        canonicalUrl: "https://backpackclan.com/trips/bhutan-cultural-trail",
        robots: "index, follow",
      },
      isFeatured: true,
      status: "published",
      sortOrder: 3,
    },
    "t4",
    2
  ),
  seedTrip(
    {
      destinationId: "5",
      categoryIds: ["2"],
      title: "Everest Base Camp Trek",
      slug: "everest-base-camp-trek",
      tripType: "trek",
      durationDays: 12,
      durationNights: 11,
      difficulty: "expert",
      maxGroupSize: 10,
      minAge: 18,
      summary: "Classic EBC trek through Sherpa villages to the base of the world's highest peak.",
      coverImageId: "5",
      gallery: ["5", "7"],
      overview: { content: "<p>The iconic Everest Base Camp trek with acclimatization days built in.</p>", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Tea house accommodation" }, { id: "i2", text: "TIMS & permits" }],
      exclusions: [{ id: "e1", text: "International flights" }],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 49999, salePrice: 45999, showStrikeThrough: true, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Everest Base Camp Trek | Backpackclan",
        metaDescription: "12-day EBC trek with expert guides and porter support.",
        ogImageId: "5",
        canonicalUrl: "https://backpackclan.com/trips/everest-base-camp-trek",
        robots: "index, follow",
      },
      isFeatured: true,
      status: "published",
      sortOrder: 4,
    },
    "t5",
    3
  ),
  seedTrip(
    {
      destinationId: "1",
      categoryIds: ["3"],
      title: "Ladakh Photography Tour",
      slug: "ladakh-photography-tour",
      tripType: "mixed",
      durationDays: 9,
      durationNights: 8,
      difficulty: "moderate",
      maxGroupSize: 8,
      minAge: null,
      summary: "Capture Ladakh's landscapes, monasteries, and lakes with a photography mentor.",
      coverImageId: "1",
      gallery: ["1"],
      overview: { content: "", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 27999, showStrikeThrough: false, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Ladakh Photography Tour | Backpackclan",
        metaDescription: "Guided photography tour across Ladakh.",
        ogImageId: "1",
        canonicalUrl: "https://backpackclan.com/trips/ladakh-photography-tour",
        robots: "index, follow",
      },
      isFeatured: false,
      status: "published",
      sortOrder: 5,
    },
    "t6",
    1
  ),
  seedTrip(
    {
      destinationId: "2",
      categoryIds: ["1"],
      title: "Spiti Bike Adventure",
      slug: "spiti-bike-adventure",
      tripType: "bike",
      durationDays: 8,
      durationNights: 7,
      difficulty: "challenging",
      maxGroupSize: 10,
      minAge: 21,
      summary: "Motorcycle expedition through Spiti's rugged terrain and high passes.",
      coverImageId: "2",
      gallery: [],
      overview: { content: "", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Bike & fuel" }],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 26999, showStrikeThrough: false, currency: "INR", pricePer: "bike" },
      seo: {
        metaTitle: "Spiti Bike Adventure | Backpackclan",
        metaDescription: "Spiti Valley motorcycle expedition.",
        ogImageId: "2",
        canonicalUrl: "https://backpackclan.com/trips/spiti-bike-adventure",
        robots: "index, follow",
      },
      isFeatured: false,
      status: "published",
      sortOrder: 6,
    },
    "t7",
    0
  ),
  seedTrip(
    {
      destinationId: "3",
      categoryIds: ["3"],
      title: "Kashmir Honeymoon Package",
      slug: "kashmir-honeymoon-package",
      tripType: "custom",
      durationDays: 5,
      durationNights: 4,
      difficulty: "easy",
      maxGroupSize: 2,
      minAge: null,
      summary: "Romantic Kashmir getaway — Dal Lake houseboat, Gulmarg, and Pahalgam.",
      coverImageId: "3",
      gallery: [],
      overview: { content: "", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [{ id: "i1", text: "Houseboat stay" }],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 25999, salePrice: 22999, showStrikeThrough: true, currency: "INR", pricePer: "couple" },
      seo: {
        metaTitle: "Kashmir Honeymoon | Backpackclan",
        metaDescription: "5-day Kashmir honeymoon package.",
        ogImageId: "3",
        canonicalUrl: "https://backpackclan.com/trips/kashmir-honeymoon-package",
        robots: "index, follow",
      },
      isFeatured: false,
      status: "published",
      sortOrder: 7,
    },
    "t8",
    1
  ),
  seedTrip(
    {
      destinationId: "5",
      categoryIds: ["2"],
      title: "Annapurna Base Camp Trek",
      slug: "annapurna-base-camp-trek",
      tripType: "trek",
      durationDays: 10,
      durationNights: 9,
      difficulty: "moderate",
      maxGroupSize: 14,
      minAge: 16,
      summary: "Trek to Annapurna Base Camp through rhododendron forests and Gurung villages.",
      coverImageId: "5",
      gallery: [],
      overview: { content: "", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 38999, showStrikeThrough: false, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Annapurna Base Camp Trek | Backpackclan",
        metaDescription: "10-day ABC trek in Nepal.",
        ogImageId: "5",
        canonicalUrl: "https://backpackclan.com/trips/annapurna-base-camp-trek",
        robots: "index, follow",
      },
      isFeatured: false,
      status: "draft",
      sortOrder: 8,
    },
    "t9"
  ),
  seedTrip(
    {
      destinationId: "1",
      categoryIds: ["4"],
      title: "Custom Ladakh Family Tour",
      slug: "custom-ladakh-family-tour",
      tripType: "custom",
      durationDays: 8,
      durationNights: 7,
      difficulty: "easy",
      maxGroupSize: 6,
      minAge: null,
      summary: "Tailor-made Ladakh itinerary for families with comfortable pacing and private vehicle.",
      coverImageId: "1",
      gallery: [],
      overview: { content: "", highlights: [], routeMapEmbed: "", routeMapImageId: null },
      itinerary: [],
      inclusions: [],
      exclusions: [],
      faqs: [],
      testimonials: [],
      pricing: { basePrice: 0, showStrikeThrough: false, currency: "INR", pricePer: "person" },
      seo: {
        metaTitle: "Custom Ladakh Family Tour | Backpackclan",
        metaDescription: "Private Ladakh family packages.",
        ogImageId: null,
        canonicalUrl: "https://backpackclan.com/trips/custom-ladakh-family-tour",
        robots: "noindex, follow",
      },
      isFeatured: false,
      status: "draft",
      sortOrder: 9,
    },
    "t10"
  ),
];

const adminTripStore = createPersistedStore("admin-trips", SEED_ADMIN_TRIPS);

function assertUniqueSlug(slug: string, excludeId?: string): void {
  const existing = adminTripStore.get().find(
    (t) => t.slug === slug && t.id !== excludeId
  );
  if (existing) throw new Error(`Slug "${slug}" is already in use`);
}

export function getAllAdminTrips(): AdminTrip[] {
  return [...adminTripStore.get()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPublishedAdminTrips(): AdminTrip[] {
  return getAllAdminTrips().filter((t) => t.status === "published");
}

export function getAdminTripById(id: string): AdminTrip | null {
  return adminTripStore.get().find((t) => t.id === id) ?? null;
}

export function getAdminTripBySlug(slug: string): AdminTrip | null {
  return adminTripStore.get().find((t) => t.slug === slug) ?? null;
}

export function adminTripToPublicTrip(trip: AdminTrip): PublicTrip {
  const destination = getDestinationById(trip.destinationId);
  const destinationName = destination?.name ?? "Unknown";
  const region: TripRegion =
    destination?.country === "India" ? "domestic" : "international";
  const primaryCategory = trip.categoryIds[0]
    ? getCategoryById(trip.categoryIds[0])?.name ?? "Group Tour"
    : "Group Tour";

  const saleActive = isSaleActive(trip.pricing);
  const resolved = resolvePricing(trip.pricing);
  const price = resolved.displayPrice;

  return {
    id: trip.id,
    slug: trip.slug,
    title: trip.title,
    destination: destinationName,
    duration: `${trip.durationNights}N/${trip.durationDays}D`,
    nights: trip.durationNights,
    route: trip.summary.slice(0, 120),
    price,
    originalPrice:
      saleActive && trip.pricing.showStrikeThrough
        ? trip.pricing.basePrice
        : undefined,
    imageId: trip.coverImageId ?? "1",
    category: primaryCategory,
    region,
    rating: 4.8,
    reviewCount: trip.testimonials.length * 40 + 20,
    isFeatured: trip.isFeatured,
    departureDates: [],
    availableMonths: ["jul", "aug", "sep"],
  };
}

export function getPublishedPublicTrips(): PublicTrip[] {
  return getPublishedAdminTrips().map(adminTripToPublicTrip);
}

export function createAdminTrip(data: AdminTripInput): AdminTrip {
  assertUniqueSlug(data.slug);
  const now = new Date().toISOString();
  const trip: AdminTrip = {
    id: generateId(),
    ...data,
    slug: slugify(data.slug),
    departuresCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  adminTripStore.set([...adminTripStore.get(), trip]);
  logActivity(`New trip "${trip.title}" added`, "trips");
  return trip;
}

export function updateAdminTrip(id: string, data: AdminTripInput): AdminTrip {
  const trips = adminTripStore.get();
  const index = trips.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Trip not found");

  assertUniqueSlug(data.slug, id);

  const updated: AdminTrip = {
    ...trips[index],
    ...data,
    slug: slugify(data.slug),
    updatedAt: new Date().toISOString(),
  };
  adminTripStore.set([
    ...trips.slice(0, index),
    updated,
    ...trips.slice(index + 1),
  ]);
  logActivity(`Trip "${updated.title}" updated`, "trips");
  return updated;
}

export function deleteAdminTrip(id: string): void {
  const trips = adminTripStore.get();
  const trip = trips.find((t) => t.id === id);
  if (!trip) throw new Error("Trip not found");
  adminTripStore.set(trips.filter((t) => t.id !== id));
  logActivity(`Trip "${trip.title}" deleted`, "trips");
}

export function duplicateAdminTrip(id: string): AdminTrip {
  const original = getAdminTripById(id);
  if (!original) throw new Error("Trip not found");

  const maxSort = Math.max(...adminTripStore.get().map((t) => t.sortOrder), 0);
  const { id: _id, createdAt, updatedAt, departuresCount, ...input } = original;

  return createAdminTrip({
    ...input,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy`,
    status: "draft",
    sortOrder: maxSort + 1,
    isFeatured: false,
  });
}

export function archiveAdminTrip(id: string): AdminTrip {
  const trip = getAdminTripById(id);
  if (!trip) throw new Error("Trip not found");
  const { id: _id, createdAt, updatedAt, departuresCount, ...input } = trip;
  return updateAdminTrip(id, { ...input, status: "archived" });
}

export function publishAdminTrip(id: string): AdminTrip {
  const trip = getAdminTripById(id);
  if (!trip) throw new Error("Trip not found");
  const { id: _id, createdAt, updatedAt, departuresCount, ...input } = trip;
  return updateAdminTrip(id, { ...input, status: "published" });
}

export function toggleTripFeatured(id: string): AdminTrip {
  const trip = getAdminTripById(id);
  if (!trip) throw new Error("Trip not found");
  const { id: _id, createdAt, updatedAt, departuresCount, ...input } = trip;
  return updateAdminTrip(id, { ...input, isFeatured: !trip.isFeatured });
}

export function bulkPublishTrips(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    try {
      publishAdminTrip(id);
      count++;
    } catch {
      // skip invalid
    }
  }
  return count;
}

export function bulkArchiveTrips(ids: string[]): number {
  let count = 0;
  for (const id of ids) {
    try {
      archiveAdminTrip(id);
      count++;
    } catch {
      // skip
    }
  }
  return count;
}

export function addInclusionTemplate(
  items: AdminTripInput["inclusions"],
  template: string
): AdminTripInput["inclusions"] {
  return [...items, { id: itemId("inc"), text: template }];
}
