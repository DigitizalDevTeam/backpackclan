export type BannerPlacement =
  | "homepage_hero"
  | "homepage_secondary"
  | "destination_page"
  | "custom";

export type BannerMediaType = "image" | "video";

export type CtaButtonStyle = "primary" | "secondary" | "outline";

export interface CtaButton {
  id: string;
  label: string;
  url: string;
  style: CtaButtonStyle;
}

export interface Banner {
  id: string;
  title: string;
  placement: BannerPlacement;
  mediaType: BannerMediaType;
  mediaId: string | null;
  headline: string;
  subheadline: string;
  linkUrl: string;
  ctaButtons: CtaButton[];
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BannerInput = Omit<Banner, "id" | "createdAt" | "updatedAt">;

export const BANNER_PLACEMENTS: Record<
  BannerPlacement,
  { label: string; description: string }
> = {
  homepage_hero: {
    label: "Homepage Hero",
    description: "Main hero banner at the top of the homepage",
  },
  homepage_secondary: {
    label: "Homepage Secondary",
    description: "Secondary promotional banner below the hero",
  },
  destination_page: {
    label: "Destination Page",
    description: "Banner shown on destination landing pages",
  },
  custom: {
    label: "Custom",
    description: "Custom placement for special campaigns",
  },
};
