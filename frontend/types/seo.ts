export type RobotsDirective = "index, follow" | "noindex, follow" | "index, nofollow" | "noindex, nofollow";

export interface SeoPageDefinition {
  pageKey: string;
  label: string;
  path: string;
  isPlaceholder?: boolean;
}

export interface SeoMeta {
  id: string;
  pageKey: string;
  metaTitle: string;
  metaDescription: string;
  ogImageId: string | null;
  canonicalUrl: string;
  robots: RobotsDirective;
  schemaJson: string;
  updatedAt: string;
}

export interface SeoMetaWithPage extends SeoMeta {
  label: string;
  path: string;
  isPlaceholder?: boolean;
}
