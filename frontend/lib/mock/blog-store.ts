import type { BlogPost } from "@/types/blog";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const SEED_POSTS: BlogPost[] = [
  {
    id: "b1",
    slug: "best-time-ladakh",
    title: "Best Time to Visit Ladakh — Seasonal Guide 2026",
    excerpt:
      "Plan your Ladakh trip with our seasonal guide covering weather, road conditions, festivals, and the ideal months for bike tours and treks.",
    content: [
      "Ladakh is one of India's most sought-after adventure destinations, but timing your visit makes all the difference. The region sits at extreme altitude, and seasons dramatically change what's possible on the roads and trails.",
      "The peak season runs from June to September when all passes are open, temperatures are pleasant (15–25°C in Leh), and most bike tours and group trips operate. This is the best window for first-timers and families.",
      "Shoulder months of May and October offer fewer crowds and lower prices, but some high passes may still be snow-bound in early May. October brings crisp skies and golden landscapes — perfect for photography tours.",
      "Winter (November–April) transforms Ladakh into a frozen wonderland. The Chadar Trek on the frozen Zanskar river runs in January–February. Most road routes from Manali remain closed until late May.",
      "Our recommendation: book June–September departures 2–3 months in advance. For Chadar or winter expeditions, plan 4–6 months ahead as seats fill quickly.",
    ],
    imageId: "1",
    category: "Ladakh",
    author: "Priya Sharma",
    authorRole: "Trip Curator",
    publishedAt: "2026-03-01",
    readTime: 6,
    tags: ["Ladakh", "Season Guide", "Planning"],
  },
  {
    id: "b2",
    slug: "spiti-guide",
    title: "Spiti Valley Road Trip Guide — Everything You Need",
    excerpt:
      "Everything you need for an epic Spiti adventure — permits, packing, acclimatization tips, and the best route from Shimla or Manali.",
    content: [
      "Spiti Valley — the Middle Land between India and Tibet — is a high-altitude desert that rewards every kilometer of the journey. Ancient monasteries, turquoise rivers, and villages perched on cliffs make this one of the Himalayas' most photogenic road trips.",
      "There are two classic approaches: the Shimla–Kinnaur route (gradual acclimatization, recommended) or the Manali–Rohtang route (faster but steeper). Our 7-day group trips typically use the Shimla approach for safer altitude gain.",
      "You'll need inner-line permits for certain areas — we handle all permit logistics for our group departures. Independent travelers should apply at Reckong Peo or online through the Himachal Pradesh portal.",
      "Pack layers, sunscreen, and a good camera. Fuel stations are sparse beyond Reckong Peo — carry extra if self-driving. Our support vehicles carry spare fuel, oxygen, and mechanical backup on every departure.",
      "Key stops: Kalpa (Kinnaur apples and Kinner Kailash views), Nako (high-altitude lake), Tabo (1,000-year-old monastery), Kaza (valley hub), Key Monastery, Hikkim (world's highest post office), and Chandratal Lake.",
    ],
    imageId: "2",
    category: "Spiti",
    author: "Rahul Mehta",
    authorRole: "Lead Road Captain",
    publishedAt: "2026-02-15",
    readTime: 8,
    tags: ["Spiti", "Road Trip", "Guide"],
  },
  {
    id: "b3",
    slug: "trek-packing",
    title: "Packing for Himalayan Treks — Essential Gear List",
    excerpt:
      "Essential gear list for high-altitude trekking in the Himalayas — from base layers to trekking poles, curated by our expedition team.",
    content: [
      "Packing right can make or break a Himalayan trek. Too much weight slows you down; too little leaves you unprepared for sudden weather changes above 4,000 meters.",
      "Base layers: merino wool or synthetic thermals (avoid cotton). Carry 2–3 sets. Mid-layers: fleece or light down jacket. Outer shell: waterproof, windproof jacket and pants are non-negotiable.",
      "Footwear: broken-in waterproof trekking boots with ankle support. Carry camp sandals for evenings. Socks: 4–5 pairs of wool-blend trekking socks plus liner socks.",
      "Essentials: 40–50L backpack with rain cover, trekking poles (highly recommended for knees), headlamp with extra batteries, water bottles or hydration bladder (2L capacity), and personal first-aid kit.",
      "Sun protection at altitude is critical: SPF 50+ sunscreen, UV-blocking sunglasses, lip balm, and a wide-brim hat. We provide sleeping bags and mats on supported treks — check your trip inclusions before packing.",
    ],
    imageId: "7",
    category: "Trekking",
    author: "Ananya Patel",
    authorRole: "Trek Leader",
    publishedAt: "2026-02-01",
    readTime: 5,
    tags: ["Trekking", "Packing", "Tips"],
  },
  {
    id: "b4",
    slug: "ladakh-bike-tour-tips",
    title: "10 Tips for Your First Ladakh Bike Tour",
    excerpt:
      "Riding through the world's highest passes? Here are 10 essential tips from our road captains for a safe and unforgettable motorcycle adventure.",
    content: [
      "A Ladakh bike tour is a bucket-list experience, but the thin air, long riding days, and unpredictable weather demand respect. After leading 50+ expeditions, our road captains share their top advice.",
      "Tip 1: Ride your own ride — don't chase the group on passes. Tip 2: Hydrate constantly — 4–5 liters daily at altitude. Tip 3: Take Diamox only after consulting your doctor.",
      "Tip 4: Break in your riding gear before the trip. Tip 5: Learn basic chain maintenance. Tip 6: Start early each day — afternoon winds on passes can be brutal.",
      "Tip 7: Carry cash — ATMs are unreliable in remote areas. Tip 8: Respect acclimatization days — they're not rest days, they're survival days. Tip 9: Photograph stops are planned — don't make unscheduled ones on narrow roads.",
      "Tip 10: Trust your road captain. They've ridden these routes hundreds of times and your safety is their only priority.",
    ],
    imageId: "1",
    category: "Ladakh",
    author: "Vikram Singh",
    authorRole: "Bike Expedition Lead",
    publishedAt: "2026-01-20",
    readTime: 7,
    tags: ["Ladakh", "Bike Tour", "Tips"],
  },
  {
    id: "b5",
    slug: "kashmir-travel-guide",
    title: "Kashmir Travel Guide — Paradise Beyond the Headlines",
    excerpt:
      "Discover why Kashmir remains one of India's most beautiful destinations — best areas to visit, safety tips, and our favorite experiences.",
    content: [
      "Kashmir has long been called paradise on earth, and one visit to Dal Lake at sunrise confirms why. Shikaras gliding on mirror-still water, snow-capped Pir Panjal peaks, and Mughal gardens create a landscape unlike anywhere else in India.",
      "Srinagar is the gateway — stay on a houseboat for the full experience. Day trips to Gulmarg (gondola rides year-round), Pahalgam (Betaab Valley and Aru), and Sonamarg (Thajiwas Glacier) are must-dos.",
      "Our Kashmir packages include all local transport, permits, and guided experiences. The Great Lakes Trek remains our most popular adventure — a 6-day high-altitude trek through seven alpine lakes.",
      "Best time: April–October for general travel, July–September for treks. Winters in Gulmarg attract skiers from across Asia.",
      "Travel with a reputable operator, keep identification handy, and follow local guidance. Our team maintains real-time route updates and government advisories for every departure.",
    ],
    imageId: "3",
    category: "Kashmir",
    author: "Priya Sharma",
    authorRole: "Trip Curator",
    publishedAt: "2026-01-08",
    readTime: 6,
    tags: ["Kashmir", "Guide", "Travel"],
  },
  {
    id: "b6",
    slug: "bhutan-travel-basics",
    title: "Bhutan Travel Basics — What Every Traveler Should Know",
    excerpt:
      "From the daily tourist tariff to monastery etiquette — your complete primer for planning a Bhutan trip with Backpackclan.",
    content: [
      "Bhutan measures success in Gross National Happiness, and visitors quickly understand why. This Himalayan kingdom limits tourist numbers to preserve its culture and environment, making every trip feel exclusive.",
      "All tourists (except Indian, Bangladeshi, and Maldivian nationals) must book through a licensed operator and pay a Sustainable Development Fee. Our packages include SDF, visas, guides, transport, and accommodation.",
      "Must-visit highlights: Paro Taktsang (Tiger's Nest monastery), Thimphu's Buddha Dordenma, Punakha Dzong, and the Phobjikha Valley (winter home of black-necked cranes).",
      "Dress modestly at religious sites — cover shoulders and knees. Remove shoes and hats before entering temples. Photography inside shrines is usually prohibited.",
      "Spring (March–May) brings rhododendron blooms. Autumn (September–November) offers clear mountain views. Our 5N/6D cultural escape covers the golden triangle at a comfortable pace.",
    ],
    imageId: "4",
    category: "Bhutan",
    author: "Tashi Dorji",
    authorRole: "Bhutan Operations",
    publishedAt: "2025-12-18",
    readTime: 5,
    tags: ["Bhutan", "International", "Culture"],
  },
];

const blogStore = createPersistedStore("blog-posts", SEED_POSTS);

export function getAllPosts(): BlogPost[] {
  return [...blogStore.get()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  return blogStore.get().find((p) => p.slug === slug) ?? null;
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category);
}

export function getBlogCategories(): string[] {
  return [...new Set(getAllPosts().map((p) => p.category))].sort();
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return getAllPosts().slice(0, limit);
  return getAllPosts()
    .filter((p) => p.slug !== slug && p.category === post.category)
    .slice(0, limit);
}
