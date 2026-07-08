export type HomepageSectionType =
  | "hero"
  | "featured_destinations"
  | "popular_trips"
  | "why_choose_us"
  | "testimonials"
  | "gallery"
  | "blog_highlights"
  | "newsletter_cta"
  | "partner_logos"
  | "faq_strip";

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
  bannerId: string | null;
  ctas: CtaLink[];
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
}

export interface TestimonialsContent {
  title: string;
  items: TestimonialCard[];
}

export interface GalleryContent {
  title: string;
  imageIds: string[];
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

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqStripContent {
  title: string;
  items: FaqItem[];
}

export type HomepageSectionContent =
  | HeroContent
  | FeaturedDestinationsContent
  | PopularTripsContent
  | WhyChooseUsContent
  | TestimonialsContent
  | GalleryContent
  | BlogHighlightsContent
  | NewsletterCtaContent
  | PartnerLogosContent
  | FaqStripContent;

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
