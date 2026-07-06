"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Monitor, PanelBottom, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MenuLocation, MenuWithStats } from "@/types/menu";

const locationIcons: Record<MenuLocation, typeof Menu> = {
  header: Menu,
  footer: PanelBottom,
  mobile: Monitor,
};

export function MenuList() {
  const [menus, setMenus] = useState<MenuWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/menus");
      const result = await res.json();
      if (result.success) setMenus(result.data);
      else toast.error("Failed to load menus");
    } catch {
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Menu Manager"
        description="Configure header, footer, and mobile navigation menus."
      />

      {menus.length === 0 ? (
        <EmptyState
          icon={<Menu className="h-6 w-6" />}
          title="No menus configured"
          description="Navigation menus will appear here once they are set up."
        />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menus.map((menu) => {
          const Icon = locationIcons[menu.location];
          return (
            <Card key={menu.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {menu.location}
                  </Badge>
                </div>
                <CardTitle className="text-base">{menu.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{menu.itemCount} items</span>
                  <span>{menu.activeCount} active</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/admin/menus/${menu.id}`}>
                    <Pencil className="h-4 w-4" />
                    Edit Menu
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
