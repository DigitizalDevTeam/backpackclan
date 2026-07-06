import { createPersistedStore } from "@/lib/mock/persisted-store";

export interface ActivityItem {
  id: string;
  action: string;
  module: string;
  timestamp: string;
}

const SEED_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    action: "Homepage hero section updated",
    module: "homepage",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    action: "New banner added for summer campaign",
    module: "banners",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    action: "Header menu reordered",
    module: "menus",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    action: "SEO meta updated for homepage",
    module: "seo",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    action: "Media library — 3 files uploaded",
    module: "media",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a6",
    action: "Global settings — branding updated",
    module: "settings",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const activityStore = createPersistedStore("activity", SEED_ACTIVITY);

export function logActivity(action: string, module: string): void {
  activityStore.replace((activities) => {
    const next = [
      {
        id: `act-${Date.now()}`,
        action,
        module,
        timestamp: new Date().toISOString(),
      },
      ...activities,
    ];
    return next.slice(0, 50);
  });
}

export function getRecentActivity(limit = 8): ActivityItem[] {
  return [...activityStore.get()]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, limit);
}
