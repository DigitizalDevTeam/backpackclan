"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Menu, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/types/auth";

interface AdminHeaderProps {
  user: AuthUser;
  onMenuClick: () => void;
}

function getBreadcrumbs(pathname: string) {
  const normalized = pathname.replace(/\/$/, "");

  if (normalized === "/admin" || normalized === "/admin/dashboard") {
    return [{ label: "Dashboard", href: "/admin/dashboard" }];
  }

  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
  const crumbs = [{ label: "Admin", href: "/admin/dashboard" }];
  let path = "/admin";

  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({
      label: segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      href: path,
    });
  }

  return crumbs;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AdminHeader({ user, onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const breadcrumbs = getBreadcrumbs(pathname);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <nav className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.href}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4" />}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="hidden capitalize sm:inline-flex">
          {user.role}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
