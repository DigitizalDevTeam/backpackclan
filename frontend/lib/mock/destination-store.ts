import type { Destination, DestinationInput } from "@/types/destination";
import type { WeatherMonth } from "@/types/travel";
import { MONTH_NAMES } from "@/types/travel";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";
import { slugify } from "@/lib/utils/slug";

function defaultWeather(): WeatherMonth[] {
  return MONTH_NAMES.map((_, i) => ({
    month: i + 1,
    avgHigh: null,
    avgLow: null,
    conditions: "",
    note: "",
  }));
}

function seedDestination(
  partial: Omit<DestinationInput, "weather"> & { weather?: WeatherMonth[] },
  id: string,
  tripCount = 0
): Destination {
  const now = "2026-02-01T10:00:00.000Z";
  return {
    id,
    tripCount,
    weather: partial.weather ?? defaultWeather(),
    ...partial,
    createdAt: now,
    updatedAt: now,
  };
}

const SEED_DESTINATIONS: Destination[] = [
  seedDestination(
    {
      name: "Leh Ladakh",
      slug: "leh-ladakh",
      country: "India",
      region: "Ladakh",
      tagline: "Land of high passes, turquoise lakes, and epic bike routes",
      heroImageId: "1",
      isFeatured: true,
      sortOrder: 0,
      status: "published",
      overview: {
        content:
          "<p>Leh Ladakh is the ultimate Himalayan adventure — dramatic mountain passes, ancient monasteries, and the legendary Manali–Leh highway. Perfect for bike tours, road trips, and high-altitude treks.</p>",
        highlights: [
          { id: "h1", icon: "🏔️", text: "Khardung La & high-altitude passes" },
          { id: "h2", icon: "🏍️", text: "World-class motorcycle touring" },
          { id: "h3", icon: "💧", text: "Pangong Lake & Nubra Valley" },
        ],
        gallery: ["1", "2", "7"],
      },
      banner: {
        headline: "Conquer Ladakh",
        subheadline: "Bike tours, road trips & treks across the roof of the world",
        ctaLabel: "View Ladakh Trips",
        ctaUrl: "/trips?destination=leh-ladakh",
        mediaId: "1",
      },
      linkedTripIds: ["t1"],
      faqs: [
        {
          id: "f1",
          question: "What is the best time to visit Ladakh?",
          answer: "<p>June to September is ideal for most trips. Roads are open and weather is pleasant for biking and trekking.</p>",
        },
        {
          id: "f2",
          question: "Do I need a permit for Ladakh?",
          answer: "<p>Indian nationals need no special permit for Leh. Protected areas like Nubra and Pangong require inner line permits, which we arrange.</p>",
        },
      ],
      bestTime: {
        content: "<p>Peak season runs June through September when all passes are open and temperatures are comfortable for outdoor activities.</p>",
        recommendedMonths: [6, 7, 8, 9],
      },
      map: {
        embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3476516.8!2d76.5762!3d34.1526!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfe5a8c8e8e8e9%3A0x8e8e8e8e8e8e8e8e!2sLadakh!5e0!3m2!1sen!2sin!4v1",
        latitude: 34.1526,
        longitude: 77.5771,
      },
      seo: {
        metaTitle: "Leh Ladakh Tours & Bike Trips | Backpackclan",
        metaDescription:
          "Explore Leh Ladakh with guided bike tours, road trips, and treks. Pangong Lake, Nubra Valley, and Himalayan adventures.",
        ogImageId: "1",
        canonicalUrl: "https://backpackclan.com/destinations/leh-ladakh",
        robots: "index, follow",
      },
    },
    "1",
    3
  ),
  seedDestination(
    {
      name: "Spiti Valley",
      slug: "spiti",
      country: "India",
      region: "Himachal Pradesh",
      tagline: "The middle land — raw landscapes and ancient monasteries",
      heroImageId: "2",
      isFeatured: true,
      sortOrder: 1,
      status: "published",
      overview: {
        content:
          "<p>Spiti Valley is a cold desert mountain valley in Himachal Pradesh. Remote villages, thousand-year-old monasteries, and the Chandratal Lake make it a bucket-list road trip.</p>",
        highlights: [
          { id: "h1", icon: "🛣️", text: "Epic road trip routes" },
          { id: "h2", icon: "🏛️", text: "Key Monastery & Tabo" },
          { id: "h3", icon: "🌙", text: "Chandratal Lake camping" },
        ],
        gallery: ["2", "5", "3"],
      },
      banner: {
        headline: "Discover Spiti",
        subheadline: "7-day circuits through India's most dramatic valley",
        ctaLabel: "Spiti Packages",
        ctaUrl: "/trips?destination=spiti",
        mediaId: "2",
      },
      linkedTripIds: ["t2"],
      faqs: [
        {
          id: "f1",
          question: "Is Spiti accessible in winter?",
          answer: "<p>Winter access is limited due to snow. May–October is the main season for road trips.</p>",
        },
      ],
      bestTime: {
        content: "<p>May to October for road access. July–August for Chandratal and comfortable temperatures.</p>",
        recommendedMonths: [5, 6, 7, 8, 9, 10],
      },
      map: { embedUrl: "", latitude: 32.2432, longitude: 78.0462 },
      seo: {
        metaTitle: "Spiti Valley Road Trips | Backpackclan",
        metaDescription: "Book Spiti Valley road trips, group tours, and custom itineraries with Backpackclan.",
        ogImageId: "2",
        canonicalUrl: "https://backpackclan.com/destinations/spiti",
        robots: "index, follow",
      },
    },
    "2",
    2
  ),
  seedDestination(
    {
      name: "Kashmir",
      slug: "kashmir",
      country: "India",
      region: "Jammu & Kashmir",
      tagline: "Paradise on earth — lakes, meadows, and alpine treks",
      heroImageId: "3",
      isFeatured: true,
      sortOrder: 2,
      status: "published",
      overview: {
        content:
          "<p>Kashmir offers stunning landscapes from Dal Lake houseboats to alpine meadows of Gulmarg and Pahalgam. Ideal for treks, family getaways, and cultural experiences.</p>",
        highlights: [
          { id: "h1", icon: "🚤", text: "Dal Lake & Srinagar" },
          { id: "h2", icon: "⛷️", text: "Gulmarg meadows & gondola" },
          { id: "h3", icon: "🥾", text: "Alpine trekking routes" },
        ],
        gallery: ["3", "4"],
      },
      banner: {
        headline: "Experience Kashmir",
        subheadline: "Trekking, sightseeing, and curated group departures",
        ctaLabel: "Kashmir Trips",
        ctaUrl: "/trips?destination=kashmir",
        mediaId: "3",
      },
      linkedTripIds: [],
      faqs: [],
      bestTime: {
        content: "<p>April to October for trekking and sightseeing. December–February for snow experiences in Gulmarg.</p>",
        recommendedMonths: [4, 5, 6, 7, 8, 9, 10],
      },
      map: { embedUrl: "", latitude: 34.0837, longitude: 74.7973 },
      seo: {
        metaTitle: "Kashmir Tours & Treks | Backpackclan",
        metaDescription: "Discover Kashmir with guided treks, group tours, and custom travel packages.",
        ogImageId: "3",
        canonicalUrl: "https://backpackclan.com/destinations/kashmir",
        robots: "index, follow",
      },
    },
    "3",
    1
  ),
  seedDestination(
    {
      name: "Bhutan",
      slug: "bhutan",
      country: "Bhutan",
      region: "Western Bhutan",
      tagline: "The last Shangri-La — happiness, monasteries, and mountain trails",
      heroImageId: "4",
      isFeatured: false,
      sortOrder: 3,
      status: "published",
      overview: {
        content:
          "<p>Bhutan balances ancient Buddhist culture with pristine Himalayan nature. Tiger's Nest, Thimphu, and Punakha valley tours offer a unique cultural immersion.</p>",
        highlights: [
          { id: "h1", icon: "🐯", text: "Tiger's Nest Monastery hike" },
          { id: "h2", icon: "🏯", text: "Fortresses & dzongs" },
          { id: "h3", icon: "🌿", text: "Carbon-negative kingdom" },
        ],
        gallery: ["4"],
      },
      banner: {
        headline: "Explore Bhutan",
        subheadline: "Cultural trails and Himalayan serenity",
        ctaLabel: "Bhutan Packages",
        ctaUrl: "/trips?destination=bhutan",
        mediaId: "4",
      },
      linkedTripIds: [],
      faqs: [],
      bestTime: {
        content: "<p>March–May and September–November offer clear skies and pleasant temperatures.</p>",
        recommendedMonths: [3, 4, 5, 9, 10, 11],
      },
      map: { embedUrl: "", latitude: 27.5142, longitude: 90.4336 },
      seo: {
        metaTitle: "Bhutan Cultural Tours | Backpackclan",
        metaDescription: "Book Bhutan group tours and custom cultural itineraries with Backpackclan.",
        ogImageId: "4",
        canonicalUrl: "https://backpackclan.com/destinations/bhutan",
        robots: "index, follow",
      },
    },
    "4",
    1
  ),
  seedDestination(
    {
      name: "Nepal",
      slug: "nepal",
      country: "Nepal",
      region: "Himalayas",
      tagline: "Everest, Annapurna, and the world's greatest trekking",
      heroImageId: "5",
      isFeatured: true,
      sortOrder: 4,
      status: "published",
      overview: {
        content:
          "<p>Nepal is a trekker's paradise — Everest Base Camp, Annapurna Circuit, and vibrant Kathmandu culture await adventurous travellers.</p>",
        highlights: [
          { id: "h1", icon: "🏔️", text: "Everest Base Camp trek" },
          { id: "h2", icon: "🙏", text: "Kathmandu heritage sites" },
          { id: "h3", icon: "🎒", text: "World-class trekking infrastructure" },
        ],
        gallery: ["5", "7"],
      },
      banner: {
        headline: "Trek Nepal",
        subheadline: "EBC, Annapurna, and guided Himalayan expeditions",
        ctaLabel: "Nepal Treks",
        ctaUrl: "/trips?destination=nepal",
        mediaId: "5",
      },
      linkedTripIds: [],
      faqs: [],
      bestTime: {
        content: "<p>Spring (March–May) and autumn (September–November) are peak trekking seasons with stable weather.</p>",
        recommendedMonths: [3, 4, 5, 9, 10, 11],
      },
      map: { embedUrl: "", latitude: 28.3949, longitude: 84.124 },
      seo: {
        metaTitle: "Nepal Treks & Tours | Backpackclan",
        metaDescription: "Everest Base Camp, Annapurna, and Nepal trekking packages with expert guides.",
        ogImageId: "5",
        canonicalUrl: "https://backpackclan.com/destinations/nepal",
        robots: "index, follow",
      },
    },
    "5",
    2
  ),
  seedDestination(
    {
      name: "Sikkim",
      slug: "sikkim",
      country: "India",
      region: "Northeast India",
      tagline: "Monasteries, rhododendrons, and Kanchenjunga views",
      heroImageId: "7",
      isFeatured: false,
      sortOrder: 5,
      status: "draft",
      overview: {
        content: "<p>Sikkim offers lush valleys, Buddhist monasteries, and views of Kanchenjunga — perfect for moderate treks and cultural tours.</p>",
        highlights: [],
        gallery: [],
      },
      banner: {
        headline: "",
        subheadline: "",
        ctaLabel: "",
        ctaUrl: "",
        mediaId: null,
      },
      linkedTripIds: [],
      faqs: [],
      bestTime: { content: "", recommendedMonths: [3, 4, 5, 10, 11] },
      map: { embedUrl: "", latitude: null, longitude: null },
      seo: {
        metaTitle: "Sikkim Tours | Backpackclan",
        metaDescription: "Explore Sikkim with Backpackclan — coming soon.",
        ogImageId: null,
        canonicalUrl: "https://backpackclan.com/destinations/sikkim",
        robots: "noindex, follow",
      },
    },
    "6",
    0
  ),
  seedDestination(
    {
      name: "Meghalaya",
      slug: "meghalaya",
      country: "India",
      region: "Northeast India",
      tagline: "Living root bridges, waterfalls, and cloud forests",
      heroImageId: null,
      isFeatured: false,
      sortOrder: 6,
      status: "draft",
      overview: {
        content: "<p>Meghalaya — the abode of clouds — features living root bridges, Cherrapunji waterfalls, and unique Khasi culture.</p>",
        highlights: [],
        gallery: [],
      },
      banner: {
        headline: "",
        subheadline: "",
        ctaLabel: "",
        ctaUrl: "",
        mediaId: null,
      },
      linkedTripIds: [],
      faqs: [],
      bestTime: { content: "", recommendedMonths: [10, 11, 12, 1, 2] },
      map: { embedUrl: "", latitude: null, longitude: null },
      seo: {
        metaTitle: "Meghalaya Tours | Backpackclan",
        metaDescription: "Meghalaya adventure tours — coming soon.",
        ogImageId: null,
        canonicalUrl: "https://backpackclan.com/destinations/meghalaya",
        robots: "noindex, follow",
      },
    },
    "7",
    0
  ),
];

const destinationStore = createPersistedStore("destinations", SEED_DESTINATIONS);

function generateId(): string {
  return String(Date.now() + Math.random()).replace(".", "");
}

export function getAllDestinations(): Destination[] {
  return [...destinationStore.get()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPublishedDestinations(): Destination[] {
  return getAllDestinations().filter((d) => d.status === "published");
}

export function getDestinationById(id: string): Destination | null {
  return destinationStore.get().find((d) => d.id === id) ?? null;
}

export function getDestinationBySlug(slug: string): Destination | null {
  return destinationStore.get().find((d) => d.slug === slug) ?? null;
}

function assertUniqueSlug(slug: string, excludeId?: string): void {
  const existing = destinationStore.get().find(
    (d) => d.slug === slug && d.id !== excludeId
  );
  if (existing) throw new Error(`Slug "${slug}" is already in use`);
}

export function createDestination(data: DestinationInput): Destination {
  assertUniqueSlug(data.slug);

  const now = new Date().toISOString();
  const destination: Destination = {
    id: generateId(),
    ...data,
    slug: slugify(data.slug),
    tripCount: data.linkedTripIds.length,
    createdAt: now,
    updatedAt: now,
  };
  destinationStore.set([...destinationStore.get(), destination]);
  logActivity(`New destination "${destination.name}" added`, "destinations");
  return destination;
}

export function updateDestination(id: string, data: DestinationInput): Destination {
  const destinations = destinationStore.get();
  const index = destinations.findIndex((d) => d.id === id);
  if (index === -1) throw new Error("Destination not found");

  assertUniqueSlug(data.slug, id);

  const updated: Destination = {
    ...destinations[index],
    ...data,
    slug: slugify(data.slug),
    tripCount: data.linkedTripIds.length,
    updatedAt: new Date().toISOString(),
  };
  destinationStore.set([
    ...destinations.slice(0, index),
    updated,
    ...destinations.slice(index + 1),
  ]);
  logActivity(`Destination "${updated.name}" updated`, "destinations");
  return updated;
}

export function deleteDestination(id: string): void {
  const destinations = destinationStore.get();
  const destination = destinations.find((d) => d.id === id);
  if (!destination) throw new Error("Destination not found");
  destinationStore.set(destinations.filter((d) => d.id !== id));
  logActivity(`Destination "${destination.name}" deleted`, "destinations");
}

export function duplicateDestination(id: string): Destination {
  const original = getDestinationById(id);
  if (!original) throw new Error("Destination not found");

  const maxSort = Math.max(...destinationStore.get().map((d) => d.sortOrder), 0);

  const { id: _id, createdAt, updatedAt, tripCount, ...input } = original;
  return createDestination({
    ...input,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy`,
    status: "draft",
    sortOrder: maxSort + 1,
    isFeatured: false,
  });
}

export function archiveDestination(id: string): Destination {
  const destination = getDestinationById(id);
  if (!destination) throw new Error("Destination not found");

  const { id: _id, createdAt, updatedAt, tripCount, ...input } = destination;
  return updateDestination(id, { ...input, status: "archived" });
}

export function toggleDestinationFeatured(id: string): Destination {
  const destination = getDestinationById(id);
  if (!destination) throw new Error("Destination not found");

  const { id: _id, createdAt, updatedAt, tripCount, ...input } = destination;
  return updateDestination(id, { ...input, isFeatured: !destination.isFeatured });
}
