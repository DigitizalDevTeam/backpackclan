import { getAllBanners } from "@/lib/mock/banner-store";
import { getAllSections } from "@/lib/mock/homepage-store";
import { getAllMedia } from "@/lib/mock/media-store";
import { getAllMenus } from "@/lib/mock/menu-store";
import { getRecentActivity } from "@/lib/mock/activity-store";
import { getAdminBookings } from "@/lib/mock/booking-store";
import {
  getLowSeatAlerts,
  getPublishedTripCount,
  getUpcomingDeparturesCount,
  type LowSeatAlert,
} from "@/lib/travel/dashboard-stats";
import { formatDistanceToNow } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import type { AdminBooking } from "@/types/admin-booking";

export interface DashboardStats {
  mediaCount: number;
  activeBanners: number;
  enabledSections: number;
  totalSections: number;
  menuItemCount: number;
  totalTrips: number;
  upcomingDepartures: number;
  lowSeatAlerts: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  paidRevenue: number;
}

export interface DashboardActivity {
  id: string;
  action: string;
  module: string;
  timeAgo: string;
}

export type { LowSeatAlert };

export async function getDashboardStats(): Promise<DashboardStats> {
  if (useLaravelApi()) {
    const session = await getSession();
    if (session) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data: DashboardStats;
      }>("/v1/admin/dashboard/stats", { token: session.token });
      if (res.ok && data.success) return data.data;
    }
  }

  const sections = getAllSections();
  const menus = getAllMenus();
  const lowSeatAlerts = getLowSeatAlerts();
  const bookings = getAdminBookings();

  return {
    mediaCount: getAllMedia().length,
    activeBanners: getAllBanners().filter((b) => b.isActive).length,
    enabledSections: sections.filter((s) => s.isEnabled).length,
    totalSections: sections.length,
    menuItemCount: menus.reduce((sum, m) => sum + m.itemCount, 0),
    totalTrips: getPublishedTripCount(),
    upcomingDepartures: getUpcomingDeparturesCount(),
    lowSeatAlerts: lowSeatAlerts.length,
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    paidRevenue: bookings.reduce((sum, b) => sum + b.paidAmount, 0),
  };
}

export async function getDashboardRecentBookings() {
  if (useLaravelApi()) {
    const session = await getSession();
    if (session) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data: AdminBooking[];
      }>("/v1/admin/dashboard/recent-bookings", { token: session.token });
      if (res.ok && data.success) return data.data;
    }
  }

  return getAdminBookings().slice(0, 8);
}

export async function getDashboardLowSeatAlerts(): Promise<LowSeatAlert[]> {
  if (useLaravelApi()) {
    const session = await getSession();
    if (session) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data: LowSeatAlert[];
      }>("/v1/admin/dashboard/low-seat-alerts", { token: session.token });
      if (res.ok && data.success) return data.data;
    }
  }

  return getLowSeatAlerts();
}

export async function getDashboardActivity(): Promise<DashboardActivity[]> {
  if (useLaravelApi()) {
    const session = await getSession();
    if (session) {
      const { res, data } = await laravelFetch<{
        success: boolean;
        data: DashboardActivity[];
      }>("/v1/admin/dashboard/activity", { token: session.token });
      if (res.ok && data.success) return data.data;
    }
  }

  return getRecentActivity(6).map((item) => ({
    id: item.id,
    action: item.action,
    module: item.module,
    timeAgo: formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }),
  }));
}
