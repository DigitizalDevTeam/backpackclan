export type HomepageSectionType =
  | "hero"
  | "featured_destinations"
  | "popular_trips"
  | "why_choose_us"
  | "testimonials"
  | "youtube_videos"
  | "gallery"
  | "blog_highlights"
  | "newsletter_cta"
  | "partner_logos"
  | "accreditations"
  | "faq_strip"
  | "category_showcase";

export interface CtaLink {
  label: string;
  url: string;
  style: "primary" | "secondary" | "outline";
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  mediaType: "image" | "video";
  mediaId: string | null;
  /** Optional poster/fallback image when mediaType is video */
  posterMediaId?: string | null;
  bannerId: string | null;
  ctas: CtaLink[];
  eyebrow?: string;
}

export interface DestinationCard {
  id: string;
  name: string;
  tripCount: number;
  imageId: string | null;
  link: string;
}

export interface FeaturedDestinationsContent {
  title: string;
  /** Published destination entity IDs — resolved to cards at render time */
  destinationIds: string[];
  /** Legacy manual cards — used when destinationIds is empty */
  cards: DestinationCard[];
}

export type PopularTripsMode = "featured" | "manual";

export interface PopularTripsContent {
  title: string;
  layout: "grid" | "carousel";
  mode: PopularTripsMode;
  /** Manual trip picks when mode is "manual" */
  tripIds: string[];
  filterTags: string[];
}

export interface WhyChooseBlock {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface WhyChooseUsContent {
  title: string;
  blocks: WhyChooseBlock[];
}

export interface TestimonialCard {
  id: string;
  name: string;
  trip: string;
  rating: number;
  text: string;
  avatarId: string | null;
  /** Link to the related trip or destination page */
  tripHref?: string;
  /** Optional media library id for the trip thumbnail */
  tripImageId?: string | null;
  /** Optional absolute image URL (used when tripImageId is empty) */
  tripImageUrl?: string | null;
  /** External review URL (e.g. Google review) */
  reviewUrl?: string | null;
}

export interface TestimonialsContent {
  title: string;
  /** Small uppercase label above the title (e.g. "Reviews") */
  eyebrow?: string;
  items: TestimonialCard[];
}

export interface YoutubeVideoItem {
  id: string;
  /** Full YouTube URL or 11-char video id */
  youtubeUrl: string;
  title?: string;
  /** Optional override thumbnail; defaults to YouTube hqdefault */
  thumbnailUrl?: string | null;
}

export interface YoutubeVideosContent {
  title: string;
  eyebrow?: string;
  items: YoutubeVideoItem[];
}

export interface GalleryItem {
  id: string;
  imageId: string | null;
  caption: string;
}

export interface GalleryContent {
  title: string;
  /** Small uppercase label (e.g. Postcards of memories) */
  eyebrow?: string;
  description?: string;
  /** Legacy flat image ids — used when items is empty */
  imageIds: string[];
  /** Preferred postcard items with per-image captions */
  items?: GalleryItem[];
}

export interface BlogPostCard {
  id: string;
  title: string;
  excerpt: string;
  imageId: string | null;
  link: string;
  date: string;
}

export interface BlogHighlightsContent {
  title: string;
  mode?: "latest" | "manual";
  postIds?: string[];
  posts: BlogPostCard[];
}

export interface NewsletterCtaContent {
  headline: string;
  description: string;
  buttonText: string;
  placeholder: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
}

export interface PartnerLogo {
  id: string;
  imageId: string | null;
  link: string;
  name: string;
}

export interface PartnerLogosContent {
  title: string;
  logos: PartnerLogo[];
}

export interface AccreditationItem {
  id: string;
  label: string;
  sublabel: string;
  imageId: string | null;
}

export interface AccreditationsContent {
  eyebrow: string;
  title: string;
  items: AccreditationItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqStripContent {
  title: string;
  items: FaqItem[];
}

/** Manual card inside a category showcase tab (months, contact destinations, etc.) */
export interface CategoryShowcaseItem {
  id: string;
  name: string;
  href: string;
  imageId: string | null;
  tripCount?: number;
}

export interface CategoryShowcaseTab {
  id: string;
  label: string;
  /** Prefer published destination IDs when available */
  destinationIds?: string[];
  /** Freeform items (resolved alongside destinations) */
  items?: CategoryShowcaseItem[];
}

export interface CategoryShowcaseContent {
  title: string;
  subtitle: string;
  href: string;
  layout: "banner-below" | "sidebar";
  categoryId: string | null;
  videoMediaId: string | null;
  posterMediaId: string | null;
  tabs: CategoryShowcaseTab[];
  /** Hydrated at render time */
  resolvedTabs?: {
    id: string;
    label: string;
    destinations: {
      name: string;
      href: string;
      image: string | null;
      imageId: string | null;
      trips?: number;
    }[];
  }[];
}

export type HomepageSectionContent =
  | HeroContent
  | FeaturedDestinationsContent
  | PopularTripsContent
  | WhyChooseUsContent
  | TestimonialsContent
  | YoutubeVideosContent
  | GalleryContent
  | BlogHighlightsContent
  | NewsletterCtaContent
  | PartnerLogosContent
  | AccreditationsContent
  | FaqStripContent
  | CategoryShowcaseContent;

export interface HomepageSection {
  id: string;
  slug: string;
  title: string;
  type: HomepageSectionType;
  sortOrder: number;
  isEnabled: boolean;
  content: HomepageSectionContent;
  updatedAt: string;
}
