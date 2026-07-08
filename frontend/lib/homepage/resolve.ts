import { getPublishedAdminTrips } from "@/lib/mock/admin-trip-store";
import {
  getDestinationById,
  getPublishedDestinations,
} from "@/lib/mock/destination-store";
import { getFeaturedTrips, getAllTrips } from "@/lib/mock/trip-store";
import { adminTripToPublicTrip } from "@/lib/mock/admin-trip-store";
import {
  getPostById,
  getPublishedPosts,
} from "@/lib/mock/blog-store";
import type {
  BlogHighlightsContent,
  BlogPostCard,
  DestinationCard,
  FeaturedDestinationsContent,
  HomepageSection,
  PopularTripsContent,
} from "@/types/homepage";
import type { PublicTrip } from "@/types/trip";
import type { BlogPost } from "@/types/blog";

function countPublishedTripsForDestination(destinationId: string): number {
  return getPublishedAdminTrips().filter((t) => t.destinationId === destinationId).length;
}

export function resolveDestinationCards(
  content: FeaturedDestinationsContent
): DestinationCard[] {
  if (content.destinationIds?.length) {
    return content.destinationIds
      .map((id) => {
        const dest = getDestinationById(id);
        if (!dest || dest.status !== "published") return null;
        const tripCount = countPublishedTripsForDestination(id) || dest.tripCount;
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

export function resolvePopularTrips(content: PopularTripsContent): PublicTrip[] {
  if (content.mode === "manual" && content.tripIds?.length) {
    const trips = content.tripIds
      .map((id) => getPublishedAdminTrips().find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => t != null)
      .map(adminTripToPublicTrip);
    if (trips.length > 0) return trips.slice(0, 8);
  }

  return getFeaturedTrips(8);
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

export function resolveBlogHighlights(content: BlogHighlightsContent): BlogPostCard[] {
  if (content.mode === "manual" && content.postIds?.length) {
    const cards = content.postIds
      .map((id) => {
        const post = getPostById(id);
        if (!post || post.status !== "published") return null;
        return blogPostToCard(post);
      })
      .filter((card): card is BlogPostCard => card != null);
    if (cards.length > 0) return cards.slice(0, 3);
  }

  if (content.posts?.length) {
    return content.posts;
  }

  return getPublishedPosts().slice(0, 3).map(blogPostToCard);
}

export function hydrateHomepageSection(section: HomepageSection): HomepageSection {
  if (section.type === "featured_destinations") {
    const content = section.content as FeaturedDestinationsContent;
    return {
      ...section,
      content: {
        ...content,
        cards: resolveDestinationCards(content),
      },
    };
  }

  if (section.type === "blog_highlights") {
    const content = section.content as BlogHighlightsContent;
    return {
      ...section,
      content: {
        ...content,
        posts: resolveBlogHighlights(content),
      },
    };
  }

  return section;
}

export function getDefaultFeaturedDestinationIds(): string[] {
  return getPublishedDestinations()
    .filter((d) => d.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((d) => d.id)
    .slice(0, 5);
}

export function getAllPublicTripsForHomepage(): PublicTrip[] {
  return getAllTrips();
}
