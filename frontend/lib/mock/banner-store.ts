import type { Banner, BannerInput } from "@/types/banner";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const SEED_BANNERS: Banner[] = [
  {
    id: "1",
    title: "Summer Ladakh Campaign",
    placement: "homepage_hero",
    mediaType: "image",
    mediaId: "1",
    headline: "Conquer the Himalayas",
    subheadline: "Epic bike tours & treks across Ladakh, Spiti & beyond",
    linkUrl: "/trips",
    ctaButtons: [
      { id: "cta1", label: "Explore Trips", url: "/trips", style: "primary" },
      { id: "cta2", label: "Custom Trip", url: "/contact", style: "outline" },
    ],
    startsAt: "2026-04-01T00:00:00.000Z",
    endsAt: "2026-09-30T23:59:59.000Z",
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Spiti Valley Promo",
    placement: "homepage_secondary",
    mediaType: "image",
    mediaId: "2",
    headline: "Spiti Valley Awaits",
    subheadline: "7-day road trip through the middle land",
    linkUrl: "/destinations/spiti",
    ctaButtons: [
      { id: "cta3", label: "View Packages", url: "/destinations/spiti", style: "primary" },
    ],
    startsAt: null,
    endsAt: null,
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    id: "3",
    title: "Bike Tour Video Hero",
    placement: "homepage_hero",
    mediaType: "video",
    mediaId: "6",
    headline: "Ride the Roof of the World",
    subheadline: "Experience the thrill of Himalayan motorcycle tours",
    linkUrl: "/trips?type=bike",
    ctaButtons: [
      { id: "cta4", label: "Watch & Book", url: "/trips?type=bike", style: "primary" },
    ],
    startsAt: null,
    endsAt: null,
    sortOrder: 2,
    isActive: false,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "4",
    title: "Kashmir Destination Banner",
    placement: "destination_page",
    mediaType: "image",
    mediaId: "3",
    headline: "Paradise on Earth",
    subheadline: "Discover Kashmir with Backpackclan",
    linkUrl: "/destinations/kashmir",
    ctaButtons: [
      { id: "cta5", label: "Explore Kashmir", url: "/destinations/kashmir", style: "secondary" },
    ],
    startsAt: "2026-05-01T00:00:00.000Z",
    endsAt: "2026-10-31T23:59:59.000Z",
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
];

const bannerStore = createPersistedStore("banners", SEED_BANNERS);

function generateId(): string {
  return String(Date.now() + Math.random()).replace(".", "");
}

export function getAllBanners(): Banner[] {
  return [...bannerStore.get()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getBannerById(id: string): Banner | null {
  return bannerStore.get().find((b) => b.id === id) ?? null;
}

export function createBanner(data: BannerInput): Banner {
  const now = new Date().toISOString();
  const banner: Banner = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  bannerStore.set([...bannerStore.get(), banner]);
  logActivity(`New banner "${banner.title}" added`, "banners");
  return banner;
}

export function updateBanner(id: string, data: BannerInput): Banner {
  const banners = bannerStore.get();
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Banner not found");

  const updated: Banner = {
    ...banners[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  bannerStore.set([
    ...banners.slice(0, index),
    updated,
    ...banners.slice(index + 1),
  ]);
  logActivity(`Banner "${updated.title}" updated`, "banners");
  return updated;
}

export function deleteBanner(id: string): void {
  const banners = bannerStore.get();
  const banner = banners.find((b) => b.id === id);
  if (!banner) throw new Error("Banner not found");
  bannerStore.set(banners.filter((b) => b.id !== id));
  logActivity(`Banner "${banner.title}" deleted`, "banners");
}

export function toggleBannerActive(id: string): Banner {
  const banner = getBannerById(id);
  if (!banner) throw new Error("Banner not found");
  return updateBanner(id, { ...banner, isActive: !banner.isActive });
}

export function duplicateBanner(id: string): Banner {
  const original = getBannerById(id);
  if (!original) throw new Error("Banner not found");

  const maxSort = Math.max(...bannerStore.get().map((b) => b.sortOrder), 0);

  return createBanner({
    title: `${original.title} (Copy)`,
    placement: original.placement,
    mediaType: original.mediaType,
    mediaId: original.mediaId,
    headline: original.headline,
    subheadline: original.subheadline,
    linkUrl: original.linkUrl,
    ctaButtons: original.ctaButtons.map((cta) => ({
      ...cta,
      id: `cta-${generateId()}`,
    })),
    startsAt: original.startsAt,
    endsAt: original.endsAt,
    sortOrder: maxSort + 1,
    isActive: false,
  });
}
