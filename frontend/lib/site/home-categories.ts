import type {
  CategoryShowcaseContent,
  FeaturedDestinationsContent,
  HeroContent,
  HomepageSection,
  NewsletterCtaContent,
  TestimonialsContent,
  YoutubeVideosContent,
} from "@/types/homepage";
import type { Banner } from "@/types/banner";
import type { Category } from "@/types/category";
import type { Destination } from "@/types/destination";
import type { PublicTrip } from "@/types/trip";

export type ResolvedDestination = {
  name: string;
  href: string;
  image: string;
  trips?: number;
};

export type ResolvedCategory = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  layout: "banner-below" | "sidebar";
  videoSrc: string;
  poster: string;
  tabs: {
    id: string;
    label: string;
    destinations: ResolvedDestination[];
  }[];
};

export type ResolvedHero = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  mediaType: "image" | "video";
  mediaUrl: string | null;
  posterUrl: string | null;
  ctas: { label: string; url: string; style: "primary" | "secondary" | "outline" }[];
};

export type ResolvedInquiry = {
  headline: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
};

export type ResolvedTestimonials = {
  eyebrow: string;
  title: string;
  items: {
    id: string;
    name: string;
    trip: string;
    tripHref: string;
    tripImage: string;
    rating: number;
    text: string;
    reviewUrl: string | null;
  }[];
};

export type ResolvedYoutubeVideos = {
  eyebrow: string;
  title: string;
  items: {
    id: string;
    youtubeId: string;
    title: string;
    thumbnailUrl: string;
  }[];
};

export type ResolvedOffer = {
  id: string;
  badge: string;
  headline: string;
  subheadline: string;
  image: string | null;
  href: string;
  ctaLabel: string;
};

export type MarketingHomepageView = {
  hero: ResolvedHero;
  categories: ResolvedCategory[];
  quickDestinations: ResolvedDestination[];
  offers: ResolvedOffer[];
  reviews: ResolvedTestimonials | null;
  videos: ResolvedYoutubeVideos | null;
  inquiry: ResolvedInquiry | null;
  internationalTrips: PublicTrip[];
  mediaMap: Record<string, string>;
};

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85";

function resolveMedia(
  mediaMap: Record<string, string>,
  id: string | null | undefined
): string | null {
  if (!id) return null;
  return mediaMap[id] ?? null;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}

/** Accepts full YouTube URLs or bare 11-char ids. */
export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      const embedIdx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (embedIdx >= 0 && parts[embedIdx + 1] && /^[\w-]{11}$/.test(parts[embedIdx + 1])) {
        return parts[embedIdx + 1];
      }
    }
  } catch {
    // ignore invalid URLs
  }
  return null;
}

function categoriesFromCatalog(
  categories: Category[],
  destinations: Destination[],
  trips: PublicTrip[],
  mediaMap: Record<string, string>
): ResolvedCategory[] {
  const layouts: Array<"banner-below" | "sidebar"> = ["banner-below", "sidebar"];

  return categories
    .filter((c) =>
      ["motor-biking", "backpacking", "treks", "custom-departures"].includes(c.slug)
    )
    .concat(
      categories.filter(
        (c) =>
          !["motor-biking", "backpacking", "treks", "custom-departures"].includes(
            c.slug
          )
      )
    )
    .slice(0, 4)
    .map((cat, index) => {
    const linkedDestinations = destinations
      .filter((d) =>
        trips.some(
          (t) =>
            t.destinationId === d.id &&
            (t.categoryIds?.includes(cat.id) || t.category === cat.name)
        )
      )
      .slice(0, 6);

    const destCards =
      linkedDestinations.length > 0
        ? linkedDestinations
        : destinations.slice(0, 6);

    return {
      id: cat.id,
      slug: cat.slug,
      title: cat.name,
      subtitle:
        stripHtml(cat.description) ||
        `Explore ${cat.name.toLowerCase()} across our top destinations.`,
      href: `/trips?category=${encodeURIComponent(cat.slug)}`,
      layout: layouts[index % layouts.length],
      videoSrc: "",
      poster: resolveMedia(mediaMap, cat.imageId) ?? FALLBACK_POSTER,
      tabs: [
        {
          id: "destinations",
          label: "Destinations",
          destinations: destCards.map((d) => ({
            name: d.name,
            href: `/trips?destination=${encodeURIComponent(d.slug)}`,
            image: resolveMedia(mediaMap, d.heroImageId) ?? FALLBACK_POSTER,
            trips: d.tripCount,
          })),
        },
      ],
    };
  });
}

export function buildMarketingHomepageView(
  sections: HomepageSection[],
  mediaMap: Record<string, string>,
  catalog?: {
    categories?: Category[];
    destinations?: Destination[];
    trips?: PublicTrip[];
    offerBanners?: Banner[];
  }
): MarketingHomepageView {
  const heroSection = sections.find((s) => s.type === "hero");
  const heroContent = (heroSection?.content ?? null) as HeroContent | null;

  const hero: ResolvedHero = {
    eyebrow: heroContent?.eyebrow ?? "Travel · Explore · Share",
    headline: heroContent?.headline ?? "Adventures that feel like tomorrow",
    subheadline:
      heroContent?.subheadline ??
      "Bike tours, treks, backpacking & custom departures across India and beyond.",
    mediaType: heroContent?.mediaType ?? "video",
    mediaUrl: resolveMedia(mediaMap, heroContent?.mediaId),
    posterUrl:
      resolveMedia(mediaMap, heroContent?.posterMediaId) ??
      resolveMedia(mediaMap, heroContent?.mediaId) ??
      FALLBACK_POSTER,
    ctas: heroContent?.ctas?.length
      ? heroContent.ctas
      : [
          { label: "Explore Trips", url: "/trips", style: "primary" },
          { label: "Enquire Now", url: "/contact", style: "outline" },
        ],
  };

  let categories: ResolvedCategory[] = sections
    .filter((s) => s.type === "category_showcase")
    .map((s) => {
      const c = s.content as CategoryShowcaseContent;
      const tabs = (c.resolvedTabs ?? c.tabs ?? []).map((tab) => ({
        id: tab.id,
        label: tab.label,
        destinations: (
          "destinations" in tab && Array.isArray(tab.destinations)
            ? tab.destinations
            : []
        ).map((d) => ({
          name: d.name,
          href: d.href,
          image: d.image ?? resolveMedia(mediaMap, d.imageId) ?? FALLBACK_POSTER,
          trips: d.trips,
        })),
      }));

      return {
        id: s.id,
        slug: s.slug,
        title: c.title,
        subtitle: c.subtitle,
        href: c.href,
        layout: c.layout,
        videoSrc: resolveMedia(mediaMap, c.videoMediaId) ?? "",
        poster: resolveMedia(mediaMap, c.posterMediaId) ?? FALLBACK_POSTER,
        tabs,
      };
    });

  if (
    categories.length === 0 &&
    catalog?.categories?.length &&
    catalog.destinations?.length
  ) {
    categories = categoriesFromCatalog(
      catalog.categories,
      catalog.destinations,
      catalog.trips ?? [],
      mediaMap
    );
  }

  const featured = sections.find((s) => s.type === "featured_destinations");
  const featuredCards =
    featured && featured.type === "featured_destinations"
      ? ((featured.content as FeaturedDestinationsContent).cards ?? [])
      : [];

  const quickDestinations: ResolvedDestination[] =
    featuredCards.length > 0
      ? featuredCards.slice(0, 8).map((card) => ({
          name: card.name,
          href: card.link,
          image: resolveMedia(mediaMap, card.imageId) ?? FALLBACK_POSTER,
          trips: card.tripCount,
        }))
      : (catalog?.destinations ?? []).slice(0, 8).map((d) => ({
          name: d.name,
          href: `/destinations/${d.slug}`,
          image: resolveMedia(mediaMap, d.heroImageId) ?? FALLBACK_POSTER,
          trips: d.tripCount,
        }));

  const ctaSection = sections.find((s) => s.type === "newsletter_cta");
  const ctaContent = (ctaSection?.content ?? null) as NewsletterCtaContent | null;
  const inquiry: ResolvedInquiry | null = ctaContent
    ? {
        headline: ctaContent.headline,
        description: ctaContent.description.replace(/<[^>]+>/g, ""),
        buttonText: ctaContent.buttonText || "Get a free quote",
        buttonUrl: "/contact",
        secondaryButtonText: ctaContent.secondaryButtonText,
        secondaryButtonUrl: ctaContent.secondaryButtonUrl ?? "/trips",
      }
    : null;

  const reviewsSection = sections.find((s) => s.type === "testimonials");
  const reviewsContent = (reviewsSection?.content ?? null) as TestimonialsContent | null;
  const reviews: ResolvedTestimonials | null =
    reviewsContent && Array.isArray(reviewsContent.items) && reviewsContent.items.length > 0
      ? {
          eyebrow: reviewsContent.eyebrow?.trim() || "Reviews",
          title: reviewsContent.title || "What Our Clients Say About Us",
          items: reviewsContent.items.map((item) => ({
            id: item.id,
            name: item.name,
            trip: item.trip,
            tripHref: item.tripHref?.trim() || "/trips",
            tripImage:
              resolveMedia(mediaMap, item.tripImageId) ??
              item.tripImageUrl ??
              FALLBACK_POSTER,
            rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
            text: stripHtml(item.text ?? ""),
            reviewUrl: item.reviewUrl?.trim() || null,
          })),
        }
      : null;

  const videosSection = sections.find((s) => s.type === "youtube_videos");
  const videosContent = (videosSection?.content ?? null) as YoutubeVideosContent | null;
  const videoItems =
    videosContent?.items
      ?.map((item) => {
        const youtubeId = extractYoutubeId(item.youtubeUrl ?? "");
        if (!youtubeId) return null;
        return {
          id: item.id,
          youtubeId,
          title: item.title?.trim() || "Watch on YouTube",
          thumbnailUrl:
            item.thumbnailUrl?.trim() ||
            `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];

  const videos: ResolvedYoutubeVideos | null =
    videoItems.length > 0
      ? {
          eyebrow: videosContent?.eyebrow?.trim() || "Videos",
          title: videosContent?.title || "Memories For Life",
          items: videoItems,
        }
      : null;

  const offers: ResolvedOffer[] = (catalog?.offerBanners ?? [])
    .filter((b) => b.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((banner) => ({
      id: banner.id,
      badge: banner.title?.trim() || "Limited Offer",
      headline: banner.headline,
      subheadline: banner.subheadline,
      image: resolveMedia(mediaMap, banner.mediaId),
      href:
        banner.ctaButtons?.[0]?.url?.trim() ||
        banner.linkUrl?.trim() ||
        "/trips",
      ctaLabel: banner.ctaButtons?.[0]?.label?.trim() || "View Offer",
    }));

  const internationalTrips = (catalog?.trips ?? [])
    .filter((t) => t.region === "international")
    .slice(0, 8);

  return {
    hero,
    categories,
    quickDestinations,
    offers,
    reviews,
    videos,
    inquiry,
    internationalTrips,
    mediaMap,
  };
}
