import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  Image,
  Flag,
  Home,
  Search,
  ArrowRight,
  Activity,
  Clock,
  Luggage,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDashboardActivity,
  getDashboardLowSeatAlerts,
  getDashboardStats,
} from "@/lib/admin/dashboard";
import { useLaravelApi } from "@/lib/api/backend";
import { getSession } from "@/lib/auth/session";

const quickActions = [
  { title: "Manage Trips", href: "/admin/trips", icon: Luggage },
  { title: "View Departures", href: "/admin/departures", icon: Calendar },
  { title: "Edit Homepage", href: "/admin/homepage", icon: Home },
  { title: "Add Banner", href: "/admin/banners/new", icon: Flag },
  { title: "Upload Media", href: "/admin/media", icon: Image },
  { title: "SEO Settings", href: "/admin/seo", icon: Search },
];

const moduleColors: Record<string, string> = {
  homepage: "bg-teal-100 text-teal-700",
  banners: "bg-orange-100 text-orange-700",
  menus: "bg-blue-100 text-blue-700",
  seo: "bg-purple-100 text-purple-700",
  media: "bg-pink-100 text-pink-700",
  settings: "bg-slate-100 text-slate-700",
  trips: "bg-emerald-100 text-emerald-700",
  destinations: "bg-sky-100 text-sky-700",
  departures: "bg-amber-100 text-amber-700",
  categories: "bg-indigo-100 text-indigo-700",
  pricing: "bg-rose-100 text-rose-700",
};

function formatDepartureDate(date: string): string {
  try {
    return format(parseISO(date.slice(0, 10)), "dd MMM yyyy");
  } catch {
    return date;
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  const user = session!.user;
  const [stats, activity, lowSeatAlerts] = await Promise.all([
    getDashboardStats(),
    getDashboardActivity(),
    getDashboardLowSeatAlerts(),
  ]);
  const apiMode = useLaravelApi();

  const statCards = [
    {
      label: "Published Trips",
      value: String(stats.totalTrips),
      sub: "live travel products",
    },
    {
      label: "Upcoming Departures",
      value: String(stats.upcomingDepartures),
      sub: "scheduled ahead",
    },
    {
      label: "Low Seat Alerts",
      value: String(stats.lowSeatAlerts),
      sub: "≤ 5 seats remaining",
    },
    {
      label: "Media Files",
      value: String(stats.mediaCount),
      sub: "images & videos",
    },
    {
      label: "Active Banners",
      value: String(stats.activeBanners),
      sub: "currently live",
    },
    {
      label: "Homepage Sections",
      value: `${stats.enabledSections}/${stats.totalSections}`,
      sub: "enabled",
    },
    {
      label: "Menu Items",
      value: String(stats.menuItemCount),
      sub: "across all menus",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name}!`}
        description={`You're signed in as ${user.role}. Travel CMS and content modules at a glance.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{action.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">API Mode</span>
              <Badge variant={apiMode ? "success" : "warning"}>
                {apiMode ? "Laravel API" : "Mock Data"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Your Role</span>
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Milestone</span>
              <Badge variant="success">M2 Travel CMS</Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/preview/homepage" target="_blank">
                Preview Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {lowSeatAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Low Seat Alerts
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/departures">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowSeatAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{alert.tripTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDepartureDate(alert.startDate)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    {alert.availableSeats} / {alert.totalSeats} seats left
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent activity yet. Start editing content to see updates here.
            </p>
          ) : (
            <div className="space-y-4">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="secondary"
                      className={`shrink-0 capitalize text-[10px] ${moduleColors[item.module] ?? ""}`}
                    >
                      {item.module}
                    </Badge>
                    <p className="text-sm truncate">{item.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-4">
                    {item.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
