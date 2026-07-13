import type { BlogPost } from "@/types/blog";
import type { Destination } from "@/types/destination";
import type {
  BlogHighlightsContent,
  BlogPostCard,
  CategoryShowcaseContent,
  CategoryShowcaseItem,
  DestinationCard,
  FeaturedDestinationsContent,
  HomepageSection,
  PopularTripsContent,
} from "@/types/homepage";
import type { PublicTrip } from "@/types/trip";

export interface HomepageCatalog {
  destinations: Destination[];
  trips: PublicTrip[];
  blogs: BlogPost[];
  mediaMap: Record<string, string>;
}

function mediaUrl(id: string | null | undefined, mediaMap: Record<string, string>): string | null {
  if (!id) return null;
  return mediaMap[id] ?? null;
}

function countTripsForDestination(destinationId: string, trips: PublicTrip[]): number {
  return trips.filter(
    (t) => String((t as PublicTrip & { destinationId?: string }).destinationId) === String(destinationId)
  ).length;
}

export function resolveDestinationCards(
  content: FeaturedDestinationsContent,
  catalog: HomepageCatalog
): DestinationCard[] {
  if (content.destinationIds?.length) {
    return content.destinationIds
      .map((id) => {
        const dest = catalog.destinations.find((d) => String(d.id) === String(id));
        if (!dest || dest.status !== "published") return null;
        const tripCount =
          countTripsForDestination(String(id), catalog.trips) || dest.tripCount;
        return {
          id: dest.id,
          name: dest.name,
          tripCount,
          imageId: dest.heroImageId,
          link: `/destinations/${dest.slug}`,
        };
      })
      .filter((card): card is DestinationCard => card != null);
  }

  return content.cards ?? [];
}

export function resolvePopularTrips(
  content: PopularTripsContent,
  catalog: HomepageCatalog
): PublicTrip[] {
  if (content.mode === "manual" && content.tripIds?.length) {
    const trips = content.tripIds
      .map((id) => catalog.trips.find((t) => t.id === id))
      .filter((t): t is PublicTrip => t != null);
    if (trips.length > 0) return trips.slice(0, 8);
  }

  return catalog.trips.filter((t) => t.isFeatured).slice(0, 8);
}

function blogPostToCard(post: BlogPost): BlogPostCard {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    imageId: post.imageId,
    link: `/blog/${post.slug}`,
    date: post.publishedAt,
  };
}

export function resolveBlogHighlights(
  content: BlogHighlightsContent,
  catalog: HomepageCatalog
): BlogPostCard[] {
  if (content.mode === "manual" && content.postIds?.length) {
    const cards = content.postIds
      .map((id) => {
        const post = catalog.blogs.find((p) => p.id === id);
        if (!post || post.status !== "published") return null;
        return blogPostToCard(post);
      })
      .filter((card): card is BlogPostCard => card != null);
    if (cards.length > 0) return cards.slice(0, 3);
  }

  if (content.posts?.length) {
    return content.posts;
  }

  return catalog.blogs.slice(0, 3).map(blogPostToCard);
}

function resolveShowcaseItem(
  item: CategoryShowcaseItem,
  mediaMap: Record<string, string>
) {
  return {
    name: item.name,
    href: item.href,
    image: mediaUrl(item.imageId, mediaMap),
    imageId: item.imageId,
    trips: item.tripCount,
  };
}

export function resolveCategoryShowcase(
  content: CategoryShowcaseContent,
  catalog: HomepageCatalog
): CategoryShowcaseContent {
  const resolvedTabs = (content.tabs ?? []).map((tab) => {
    const fromDestinations = (tab.destinationIds ?? [])
      .map((id) => {
        const dest = catalog.destinations.find((d) => String(d.id) === String(id));
        if (!dest || dest.status !== "published") return null;
        const tripCount =
          countTripsForDestination(String(id), catalog.trips) || dest.tripCount;
        return {
          name: dest.name,
          href: `/trips?destination=${dest.slug}`,
          image: mediaUrl(dest.heroImageId, catalog.mediaMap),
          imageId: dest.heroImageId,
          trips: tripCount,
        };
      })
      .filter((d): d is NonNullable<typeof d> => d != null);

    const fromItems = (tab.items ?? []).map((item) =>
      resolveShowcaseItem(item, catalog.mediaMap)
    );

    return {
      id: tab.id,
      label: tab.label,
      destinations: [...fromDestinations, ...fromItems],
    };
  });

  return {
    ...content,
    resolvedTabs,
  };
}

export function hydrateHomepageSection(
  section: HomepageSection,
  catalog: HomepageCatalog
): HomepageSection {
  if (section.type === "featured_destinations") {
    const content = section.content as FeaturedDestinationsContent;
    return {
      ...section,
      content: {
        ...content,
        cards: resolveDestinationCards(content, catalog),
      },
    };
  }

  if (section.type === "blog_highlights") {
    const content = section.content as BlogHighlightsContent;
    return {
      ...section,
      content: {
        ...content,
        posts: resolveBlogHighlights(content, catalog),
      },
    };
  }

  if (section.type === "category_showcase") {
    const content = section.content as CategoryShowcaseContent;
    return {
      ...section,
      content: resolveCategoryShowcase(content, catalog),
    };
  }

  return section;
}

export function getDefaultFeaturedDestinationIds(
  destinations: Destination[]
): string[] {
  return destinations
    .filter((d) => d.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => d.id)
    .slice(0, 5);
}
