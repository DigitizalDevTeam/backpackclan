import type { HomepageSection, HomepageSectionType } from "@/types/homepage";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const now = () => new Date().toISOString();

function section(
  id: string,
  slug: string,
  title: string,
  type: HomepageSectionType,
  sortOrder: number,
  isEnabled: boolean,
  content: HomepageSection["content"]
): HomepageSection {
  return { id, slug, title, type, sortOrder, isEnabled, content, updatedAt: now() };
}

const SEED_SECTIONS: HomepageSection[] = [
  section("1", "hero", "Hero Banner", "hero", 0, true, {
    headline: "Explore the Himalayas with Backpackclan",
    subheadline:
      "Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal.",
    mediaType: "image",
    mediaId: "1",
    bannerId: "1",
    ctas: [
      { label: "Explore Trips", url: "/trips", style: "primary" },
      { label: "Custom Trip Inquiry", url: "/contact", style: "outline" },
    ],
  }),
  section("2", "featured-destinations", "Featured Destinations", "featured_destinations", 1, true, {
    title: "Popular Destinations",
    cards: [
      { id: "d1", name: "Leh Ladakh", tripCount: 24, imageId: "1", link: "/destinations/leh-ladakh" },
      { id: "d2", name: "Spiti Valley", tripCount: 18, imageId: "2", link: "/destinations/spiti" },
      { id: "d3", name: "Kashmir", tripCount: 15, imageId: "3", link: "/destinations/kashmir" },
      { id: "d4", name: "Bhutan", tripCount: 12, imageId: "4", link: "/destinations/bhutan" },
      { id: "d5", name: "Nepal", tripCount: 20, imageId: "5", link: "/destinations/nepal" },
    ],
  }),
  section("3", "popular-trips", "Popular Trips", "popular_trips", 2, true, {
    title: "Trending Adventures",
    layout: "carousel",
    filterTags: ["Bike Tour", "Trek", "Guaranteed Departures", "Weekend"],
  }),
  section("4", "why-choose-us", "Why Choose Us", "why_choose_us", 3, true, {
    title: "Why Travel with Backpackclan?",
    blocks: [
      { id: "w1", icon: "Shield", title: "Safe & Verified", description: "Experienced guides and safety-first approach on every trip." },
      { id: "w2", icon: "Users", title: "Small Groups", description: "Intimate group sizes for a personal adventure experience." },
      { id: "w3", icon: "MapPin", title: "Local Expertise", description: "Deep knowledge of Himalayan routes and hidden gems." },
      { id: "w4", icon: "Star", title: "4.8★ Rated", description: "Thousands of happy travelers and glowing reviews." },
    ],
  }),
  section("5", "testimonials", "Testimonials", "testimonials", 4, true, {
    title: "What Travelers Say",
    items: [
      { id: "t1", name: "Rahul Sharma", trip: "Leh Ladakh Bike Trip", rating: 5, text: "An absolutely incredible experience! The team handled everything perfectly.", avatarId: null },
      { id: "t2", name: "Priya Mehta", trip: "Spiti Valley Tour", rating: 5, text: "Best travel company for Himalayan adventures. Highly recommended!", avatarId: null },
      { id: "t3", name: "Arjun Patel", trip: "Kashmir Trek", rating: 4, text: "Great guides, beautiful scenery, and seamless organization throughout.", avatarId: null },
    ],
  }),
  section("6", "gallery", "Instagram / Gallery", "gallery", 5, true, {
    title: "Adventures in Pictures",
    imageIds: ["1", "2", "3", "4", "5", "7"],
  }),
  section("7", "blog-highlights", "Blog Highlights", "blog_highlights", 6, true, {
    title: "From Our Blog",
    posts: [
      { id: "b1", title: "Best Time to Visit Ladakh", excerpt: "Plan your Ladakh trip with our seasonal guide...", imageId: "1", link: "/blog/best-time-ladakh", date: "2026-03-01" },
      { id: "b2", title: "Spiti Valley Road Trip Guide", excerpt: "Everything you need for an epic Spiti adventure...", imageId: "2", link: "/blog/spiti-guide", date: "2026-02-15" },
      { id: "b3", title: "Packing for Himalayan Treks", excerpt: "Essential gear list for high-altitude trekking...", imageId: "7", link: "/blog/trek-packing", date: "2026-02-01" },
    ],
  }),
  section("8", "newsletter-cta", "Newsletter CTA", "newsletter_cta", 7, true, {
    headline: "Get Exclusive Trip Deals",
    description: "Subscribe for early-bird discounts, new trip launches, and travel tips.",
    buttonText: "Subscribe",
    placeholder: "Enter your email",
  }),
  section("9", "partner-logos", "Partner Logos", "partner_logos", 8, false, {
    title: "Our Partners",
    logos: [
      { id: "p1", name: "Partner 1", imageId: "1", link: "#" },
      { id: "p2", name: "Partner 2", imageId: "2", link: "#" },
      { id: "p3", name: "Partner 3", imageId: "4", link: "#" },
    ],
  }),
  section("10", "faq-strip", "FAQ Strip", "faq_strip", 9, true, {
    title: "Frequently Asked Questions",
    items: [
      { id: "f1", question: "What is included in the trip price?", answer: "Accommodation, meals as per itinerary, permits, and guide services." },
      { id: "f2", question: "Do you offer custom trips?", answer: "Yes! Contact us for fully customized private group adventures." },
      { id: "f3", question: "What is the cancellation policy?", answer: "Free cancellation up to 30 days before departure. Terms apply." },
    ],
  }),
];

const sectionStore = createPersistedStore("homepage-sections", SEED_SECTIONS);

export function getAllSections(): HomepageSection[] {
  return [...sectionStore.get()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getEnabledSections(): HomepageSection[] {
  return getAllSections().filter((s) => s.isEnabled);
}

export function getSectionBySlug(slug: string): HomepageSection | null {
  return sectionStore.get().find((s) => s.slug === slug) ?? null;
}

export function reorderSections(orderedIds: string[]): HomepageSection[] {
  sectionStore.replace((sections) => {
    const next = [...sections];
    orderedIds.forEach((id, index) => {
      const idx = next.findIndex((s) => s.id === id);
      if (idx !== -1) {
        next[idx] = { ...next[idx], sortOrder: index, updatedAt: now() };
      }
    });
    return next;
  });
  logActivity("Homepage sections reordered", "homepage");
  return getAllSections();
}

export function toggleSectionEnabled(slug: string): HomepageSection {
  let updated!: HomepageSection;
  sectionStore.replace((sections) => {
    const next = [...sections];
    const idx = next.findIndex((s) => s.slug === slug);
    if (idx === -1) throw new Error("Section not found");
    next[idx] = {
      ...next[idx],
      isEnabled: !next[idx].isEnabled,
      updatedAt: now(),
    };
    updated = next[idx];
    return next;
  });
  logActivity(
    `${updated.title} section ${updated.isEnabled ? "enabled" : "disabled"}`,
    "homepage"
  );
  return updated;
}

export function updateSectionContent(
  slug: string,
  content: HomepageSection["content"]
): HomepageSection {
  let updated!: HomepageSection;
  sectionStore.replace((sections) => {
    const next = [...sections];
    const idx = next.findIndex((s) => s.slug === slug);
    if (idx === -1) throw new Error("Section not found");
    next[idx] = { ...next[idx], content, updatedAt: now() };
    updated = next[idx];
    return next;
  });
  logActivity(`${updated.title} section updated`, "homepage");
  return updated;
}
