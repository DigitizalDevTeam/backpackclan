"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mountain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getNavGroupsForUser,
  previewNavItem,
  type NavGroup,
  type NavItem,
} from "@/lib/admin/navigation";
import type { AuthUser } from "@/types/auth";

const STORAGE_KEY = "admin-nav-groups";

interface AdminSidebarProps {
  user: AuthUser;
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActiveItem(pathname: string, items: NavItem[]): boolean {
  return items.some((item) => isNavItemActive(pathname, item.href));
}

function buildDefaultOpenGroups(groups: NavGroup[]): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const group of groups) {
    if (group.label) {
      open[group.label] = true;
    }
  }
  return open;
}

function NavLink({
  item,
  pathname,
  collapsed,
  subMenu = false,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  subMenu?: boolean;
  onNavigate?: () => void;
}) {
  const isActive = isNavItemActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.title : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
        collapsed ? "justify-center px-3 py-2.5" : subMenu ? "pl-3 pr-3" : "px-3 py-2.5",
        isActive
          ? "bg-sidebar-active text-white"
          : "text-sidebar-muted hover:bg-white/10 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

function CollapsibleNavGroup({
  group,
  pathname,
  collapsed,
  isOpen,
  onToggle,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const GroupIcon = group.icon;
  const hasActiveChild = groupHasActiveItem(pathname, group.items);

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          hasActiveChild
            ? "text-white"
            : "text-sidebar-muted hover:bg-white/10 hover:text-white"
        )}
      >
        {GroupIcon && <GroupIcon className="h-5 w-5 shrink-0" />}
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="ml-4 space-y-0.5 pl-2">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={false}
                subMenu
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  user,
  collapsed,
  onToggle,
  mobile = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const navGroups = getNavGroupsForUser(user);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildDefaultOpenGroups(navGroups)
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOpenGroups((prev) => ({
          ...prev,
          ...JSON.parse(stored),
        }));
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;

      for (const group of navGroups) {
        if (
          group.label &&
          groupHasActiveItem(pathname, group.items) &&
          !next[group.label]
        ) {
          next[group.label] = true;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [pathname, navGroups]);

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        mobile ? "w-full" : collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3 overflow-hidden"
          onClick={onNavigate}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-active">
            <Mountain className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Backpackclan
              </p>
              <p className="truncate text-xs text-sidebar-muted">Admin Panel</p>
            </div>
          )}
        </Link>
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 shrink-0 text-sidebar-muted hover:bg-white/10 hover:text-white"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navGroups.map((group, groupIndex) => {
          if (!group.label) {
            return (
              <div key={`group-${groupIndex}`} className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            );
          }

          return (
            <div
              key={group.label}
              className={cn(groupIndex > 0 && "mt-1")}
            >
              <CollapsibleNavGroup
                group={group}
                pathname={pathname}
                collapsed={collapsed}
                isOpen={openGroups[group.label] ?? false}
                onToggle={() => toggleGroup(group.label!)}
                onNavigate={onNavigate}
              />
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href={previewNavItem.href}
          target="_blank"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          <previewNavItem.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>{previewNavItem.title}</span>}
        </Link>
      </div>
    </aside>
  );
}
