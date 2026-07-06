import type { Banner } from "@/types/banner";

export function getBannerScheduleStatus(
  banner: Banner
): "active" | "scheduled" | "expired" | "inactive" {
  if (!banner.isActive) return "inactive";
  const now = new Date();
  if (banner.startsAt && new Date(banner.startsAt) > now) return "scheduled";
  if (banner.endsAt && new Date(banner.endsAt) < now) return "expired";
  return "active";
}
