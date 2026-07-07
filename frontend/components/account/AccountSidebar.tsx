"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/account/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/bookings", label: "My Bookings", icon: CalendarDays },
  { href: "/account/profile", label: "Profile", icon: User },
];

interface AccountSidebarProps {
  onNavigate?: () => void;
  className?: string;
}

export function AccountSidebar({ onNavigate, className }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className={cn("flex w-full flex-col", className)}>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-primary text-white shadow-sm"
                : "text-slate-700 hover:bg-white hover:text-primary"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            onNavigate?.();
            handleLogout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
