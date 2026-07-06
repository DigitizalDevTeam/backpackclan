import Link from "next/link";
import {
  Image,
  Flag,
  Home,
  Search,
  ArrowRight,
  Activity,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardActivity, getDashboardStats } from "@/lib/admin/dashboard";
import { useLaravelApi } from "@/lib/api/backend";
import { getSession } from "@/lib/auth/session";

const quickActions = [
  { title: "Add Banner", href: "/admin/banners/new", icon: Flag },
  { title: "Upload Media", href: "/admin/media", icon: Image },
  { title: "Edit Homepage", href: "/admin/homepage", icon: Home },
  { title: "SEO Settings", href: "/admin/seo", icon: Search },
];

const moduleColors: Record<string, string> = {
  homepage: "bg-teal-100 text-teal-700",
  banners: "bg-orange-100 text-orange-700",
  menus: "bg-blue-100 text-blue-700",
  seo: "bg-purple-100 text-purple-700",
  media: "bg-pink-100 text-pink-700",
  settings: "bg-slate-100 text-slate-700",
};

export default async function DashboardPage() {
  const session = await getSession();
  const user = session!.user;
  const stats = await getDashboardStats();
  const activity = await getDashboardActivity();
  const apiMode = useLaravelApi();

  const statCards = [
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
        title={`Welcome back, ${user.name.split(" ")[0]}!`}
        description={`You're signed in as ${user.role}. Here's an overview of your travel portal CMS.`}
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
                  <span className="flex-1 text-sm font-medium">
                    {action.title}
                  </span>
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
              <Badge variant="success">M1 UI Ready</Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/preview/homepage" target="_blank">
                Preview Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

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
