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
    eyebrow: "Travel · Explore · Share",
    headline: "Adventures that feel like tomorrow",
    subheadline:
      "Bike tours, treks, backpacking & custom departures across India and beyond.",
    mediaType: "video",
    mediaId: "6",
    posterMediaId: "2",
    bannerId: "1",
    ctas: [
      { label: "Explore Trips", url: "/trips", style: "primary" },
      { label: "Enquire Now", url: "/contact", style: "outline" },
    ],
  }),
  section("11", "motor-biking", "Motor Biking", "category_showcase", 1, true, {
    title: "Motor Biking",
    subtitle: "High passes, open roads, and legendary Himalayan circuits.",
    href: "/trips?category=motor-biking",
    layout: "banner-below",
    categoryId: "1",
    videoMediaId: "9",
    posterMediaId: "1",
    tabs: [
      {
        id: "india",
        label: "India",
        destinationIds: ["1", "2", "8"],
        items: [],
      },
      {
        id: "international",
        label: "International",
        destinationIds: ["4", "5"],
        items: [],
      },
      {
        id: "months",
        label: "Month-wise",
        destinationIds: [],
        items: [
          { id: "bq1", name: "Jan – Mar", href: "/trips?category=motor-biking&month=jan", imageId: "7", tripCount: 3 },
          { id: "bq2", name: "Apr – Jun", href: "/trips?category=motor-biking&month=apr", imageId: "2", tripCount: 5 },
          { id: "bq3", name: "Jul – Sep", href: "/trips?category=motor-biking&month=jul", imageId: "1", tripCount: 6 },
          { id: "bq4", name: "Oct – Dec", href: "/trips?category=motor-biking&month=oct", imageId: "5", tripCount: 4 },
        ],
      },
    ],
  }),
  section("12", "backpacking", "Backpacking", "category_showcase", 2, true, {
    title: "Backpacking",
    subtitle: "Slow travel, local stays, and stories worth sharing.",
    href: "/trips?category=backpacking",
    layout: "banner-below",
    categoryId: "3",
    videoMediaId: "11",
    posterMediaId: "13",
    tabs: [
      {
        id: "india",
        label: "India",
        destinationIds: ["2", "9", "7"],
        items: [],
      },
      {
        id: "international",
        label: "International",
        destinationIds: ["4", "5"],
        items: [],
      },
      {
        id: "months",
        label: "Month-wise",
        destinationIds: [],
        items: [
          { id: "pq1", name: "Jan – Mar", href: "/trips?category=backpacking&month=jan", imageId: "13", tripCount: 4 },
          { id: "pq2", name: "Apr – Jun", href: "/trips?category=backpacking&month=apr", imageId: "2", tripCount: 5 },
          { id: "pq3", name: "Jul – Sep", href: "/trips?category=backpacking&month=jul", imageId: "5", tripCount: 5 },
          { id: "pq4", name: "Oct – Dec", href: "/trips?category=backpacking&month=oct", imageId: "1", tripCount: 6 },
        ],
      },
    ],
  }),
  section("13", "treks", "Treks", "category_showcase", 3, true, {
    title: "Treks",
    subtitle: "Season-ready Himalayan trails — pick your month, pack your bag.",
    href: "/trips?category=treks",
    layout: "banner-below",
    categoryId: "2",
    videoMediaId: "10",
    posterMediaId: "7",
    tabs: [
      {
        id: "india",
        label: "India",
        destinationIds: ["3", "6"],
        items: [],
      },
      {
        id: "international",
        label: "International",
        destinationIds: ["5"],
        items: [],
      },
      {
        id: "months",
        label: "Month-wise",
        destinationIds: [],
        items: [
          { id: "q1", name: "Jan – Mar", href: "/trips?category=treks&month=jan", imageId: "7", tripCount: 4 },
          { id: "q2", name: "Apr – Jun", href: "/trips?category=treks&month=apr", imageId: "2", tripCount: 5 },
          { id: "q3", name: "Jul – Sep", href: "/trips?category=treks&month=jul", imageId: "5", tripCount: 6 },
          { id: "q4", name: "Oct – Dec", href: "/trips?category=treks&month=oct", imageId: "1", tripCount: 5 },
        ],
      },
    ],
  }),
  section("14", "custom-departures", "Custom Departures", "category_showcase", 4, true, {
    title: "Custom Departures",
    subtitle: "Private groups and bespoke itineraries, built around your dates.",
    href: "/contact",
    layout: "banner-below",
    categoryId: "4",
    videoMediaId: "12",
    posterMediaId: "15",
    tabs: [
      {
        id: "india",
        label: "India",
        destinationIds: ["10", "9", "2"],
        items: [],
      },
      {
        id: "international",
        label: "International",
        destinationIds: ["13", "4", "5"],
        items: [],
      },
    ],
  }),
  section("2", "featured-destinations", "Featured Destinations", "featured_destinations", 5, true, {
    title: "Popular Destinations",
    destinationIds: ["1", "2", "3", "4", "5", "6", "7"],
    cards: [],
  }),
  section("3", "popular-trips", "Popular Trips", "popular_trips", 6, false, {
    title: "Trending Adventures",
    layout: "carousel",
    mode: "featured",
    tripIds: [],
    filterTags: ["Bike Tour", "Trek", "Guaranteed Departures", "Weekend"],
  }),
  section("4", "why-choose-us", "Why Choose Us", "why_choose_us", 7, false, {
    title: "Why Travel with Backpackclan?",
    blocks: [
      { id: "w1", icon: "Shield", title: "Safe & Verified", description: "Experienced guides and safety-first approach on every trip." },
      { id: "w2", icon: "Users", title: "Small Groups", description: "Intimate group sizes for a personal adventure experience." },
      { id: "w3", icon: "MapPin", title: "Local Expertise", description: "Deep knowledge of Himalayan routes and hidden gems." },
      { id: "w4", icon: "Star", title: "4.8★ Rated", description: "Thousands of happy travelers and glowing reviews." },
    ],
  }),
  section("5", "testimonials", "Testimonials", "testimonials", 8, true, {
    title: "Trusted by thousands of Himalayan travellers",
    eyebrow: "Reviews",
    items: [
      {
        id: "t1",
        name: "Ananya Kapoor",
        trip: "Leh Ladakh Bike Expedition",
        tripHref: "/trips?destination=leh-ladakh",
        tripImageId: "1",
        tripImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "From the high passes to the campfire nights, everything was planned to perfection. The BackpackClan crew made our first Himalayan ride feel safe and unforgettable.",
        avatarId: null,
      },
      {
        id: "t2",
        name: "devansh mehta",
        trip: "Spiti Valley Backpacking Circuit",
        tripHref: "/trips?destination=spiti",
        tripImageId: "2",
        tripImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "Honestly the best group trip I've done. Small batch, great guides, and zero chaos with permits or stays. Spiti looked even better than the photos.",
        avatarId: null,
      },
      {
        id: "t3",
        name: "Sneha Iyer",
        trip: "Kashmir Great Lakes Trek",
        tripHref: "/trips?destination=kashmir",
        tripImageId: "3",
        tripImageUrl: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "The meadows, the lakes, the food — every day felt like a postcard. Support staff were attentive without hovering. Already booking our next trek with them.",
        avatarId: null,
      },
      {
        id: "t4",
        name: "Rohit Banerjee",
        trip: "Bhutan Custom Departure",
        tripHref: "/trips?destination=bhutan",
        tripImageId: "4",
        tripImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80",
        reviewUrl: null,
        rating: 5,
        text: "They built a private itinerary around our dates and it still felt like a proper adventure, not a rushed checklist. Smooth border formalities and lovely stays.",
        avatarId: null,
      },
      {
        id: "t5",
        name: "Meera Joshi",
        trip: "Nepal Everest Region Trek",
        tripHref: "/trips?destination=nepal",
        tripImageId: "5",
        tripImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 4,
        text: "Tough days, beautiful nights, and a team that checked on everyone. Acclimatization pacing was sensible and the local guides knew every ridge like home.",
        avatarId: null,
      },
      {
        id: "t6",
        name: "Karan Malhotra",
        trip: "Tawang Monastery Trail",
        tripHref: "/trips?search=tawang",
        tripImageId: "2",
        tripImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "Tawang was magical — snow peaks, warm homestays, and a guide who knew every monastery story. Backpackclan made a complex route feel effortless.",
        avatarId: null,
      },
      {
        id: "t7",
        name: "Pooja Nair",
        trip: "Ladakh Family Circuit",
        tripHref: "/trips?destination=leh-ladakh",
        tripImageId: "1",
        tripImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "We traveled with two kids and grandparents — the pacing, stays, and oxygen support were thoughtful. Ladakh felt safe and spectacular for the whole family.",
        avatarId: null,
      },
      {
        id: "t8",
        name: "Arjun Desai",
        trip: "Spiti Winter Expedition",
        tripHref: "/trips?destination=spiti",
        tripImageId: "2",
        tripImageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
        reviewUrl: null,
        rating: 5,
        text: "Winter Spiti is not for everyone — but their prep briefing, gear checklist, and backup vehicle gave us confidence. An raw, beautiful experience.",
        avatarId: null,
      },
      {
        id: "t9",
        name: "Nisha Verma",
        trip: "Kashmir Alpine Lakes",
        tripHref: "/trips?destination=kashmir",
        tripImageId: "3",
        tripImageUrl: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "Every campsite was scenic, every meal hearty. The trek leaders balanced safety with letting us enjoy the trail at our own rhythm. Already recommended to friends.",
        avatarId: null,
      },
      {
        id: "t10",
        name: "Vivek Reddy",
        trip: "Everest Base Camp Trek",
        tripHref: "/trips?destination=nepal",
        tripImageId: "5",
        tripImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "EBC had been on my bucket list for years. Transparent pricing, solid acclimatization plan, and porters who genuinely cared — worth every rupee.",
        avatarId: null,
      },
      {
        id: "t11",
        name: "Ishita Chawla",
        trip: "Bhutan Cultural Escape",
        tripHref: "/trips?destination=bhutan",
        tripImageId: "4",
        tripImageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80",
        reviewUrl: "https://www.google.com/maps",
        rating: 5,
        text: "Bhutan's pace suits slow travel — Tiger's Nest at sunrise was the highlight. Visa, permits, and boutique stays were handled without us chasing paperwork.",
        avatarId: null,
      },
    ],
  }),
  section("15", "youtube-videos", "YouTube Videos", "youtube_videos", 9, true, {
    eyebrow: "Videos",
    title: "Memories For Life",
    items: [
      {
        id: "yt1",
        title: "Leh Ladakh Motorcycle Diaries",
        youtubeUrl: "https://www.youtube.com/watch?v=LXb3EKWsInQ",
        thumbnailUrl: null,
      },
      {
        id: "yt2",
        title: "Spiti Valley Road Trip",
        youtubeUrl: "https://www.youtube.com/watch?v=s6zR2T9vn2c",
        thumbnailUrl: null,
      },
      {
        id: "yt3",
        title: "Himalayan Trek Stories",
        youtubeUrl: "https://www.youtube.com/watch?v=YeF-Q6sCtEI",
        thumbnailUrl: null,
      },
      {
        id: "yt4",
        title: "Kashmir Trails",
        youtubeUrl: "https://www.youtube.com/watch?v=hY7m5jjJ9mM",
        thumbnailUrl: null,
      },
      {
        id: "yt5",
        title: "Bhutan Custom Departures",
        youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        thumbnailUrl: null,
      },
    ],
  }),
  section("6", "gallery", "Postcards / Memories", "gallery", 10, true, {
    title: "Moments from the road",
    eyebrow: "Postcards of memories",
    description: "Real frames from our batches — polaroids worth pinning to the fridge.",
    imageIds: ["1", "2", "3", "4", "5"],
    items: [
      { id: "mem1", imageId: "1", caption: "Spiti nights" },
      { id: "mem2", imageId: "2", caption: "Ladakh passes" },
      { id: "mem3", imageId: "3", caption: "Trail crew" },
      { id: "mem4", imageId: "4", caption: "Summit views" },
      { id: "mem5", imageId: "5", caption: "Bhutan trails" },
    ],
  }),
  section("7", "blog-highlights", "Blog Highlights", "blog_highlights", 11, false, {
    title: "From Our Blog",
    mode: "latest",
    postIds: [],
    posts: [],
  }),
  section("8", "newsletter-cta", "Inquiry CTA", "newsletter_cta", 12, true, {
    headline: "We're here to help you pick the perfect trip",
    description: "Share your dates, group size, and vibe — we'll craft an itinerary that fits.",
    buttonText: "Get a free quote",
    placeholder: "",
    secondaryButtonText: "Browse trips",
    secondaryButtonUrl: "/trips",
  }),
  section("9", "partner-logos", "Partner Logos", "partner_logos", 13, false, {
    title: "Our Partners",
    logos: [
      { id: "p1", name: "Partner 1", imageId: "1", link: "#" },
      { id: "p2", name: "Partner 2", imageId: "2", link: "#" },
      { id: "p3", name: "Partner 3", imageId: "4", link: "#" },
    ],
  }),
  section("10", "faq-strip", "FAQ Strip", "faq_strip", 14, false, {
    title: "Frequently Asked Questions",
    items: [
      { id: "f1", question: "What is included in the trip price?", answer: "Accommodation, meals as per itinerary, permits, and guide services." },
      { id: "f2", question: "Do you offer custom trips?", answer: "Yes! Contact us for fully customized private group adventures." },
      { id: "f3", question: "What is the cancellation policy?", answer: "Free cancellation up to 30 days before departure. Terms apply." },
    ],
  }),
  section("11", "accreditations", "Accreditations", "accreditations", 15, true, {
    eyebrow: "Trust & branding",
    title: "Recognized. Rated. Trusted.",
    items: [
      { id: "google", label: "Google", sublabel: "4.5★ traveller rating", imageId: null },
      { id: "tripadvisor", label: "TripAdvisor", sublabel: "4.7★ top-rated operator", imageId: null },
      { id: "startup-india", label: "Startup India", sublabel: "DPIIT recognized", imageId: null },
      { id: "msme", label: "MSME", sublabel: "Government of India", imageId: null },
      { id: "uttarakhand", label: "Uttarakhand Tourism", sublabel: "Recognized operator", imageId: null },
      { id: "tripadvisor-choice", label: "Travelers' Choice", sublabel: "TripAdvisor Award", imageId: null },
    ],
  }),
];

/** v6 seed: memories gallery enabled + editable postcard captions */
const sectionStore = createPersistedStore("homepage-sections-v6", SEED_SECTIONS);

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
