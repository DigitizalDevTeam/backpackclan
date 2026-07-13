"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import type { AuthUser } from "@/types/auth";
import { getAuthHomePath, isCustomerUser } from "@/lib/auth/user-kind";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function HeaderAuthMenu({ light = false }: { light?: boolean }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      setUser(null);
      toast.success("Logged out");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to log out");
    }
  }

  if (loading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className={cn("hidden sm:inline-flex", light && "text-white")}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (user) {
    const accountHref = getAuthHomePath(user);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "hidden gap-2 sm:inline-flex",
              light && "border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            )}
          >
            <User className="h-4 w-4" />
            {user?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={accountHref}>
              {isCustomerUser(user) ? (
                <>
                  <LayoutDashboard className="h-4 w-4" />
                  My Account
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Admin Dashboard
                </>
              )}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className={cn(
          "hidden sm:inline-flex",
          light && "text-white/85 hover:bg-white/10 hover:text-white"
        )}
      >
        <Link href="/login">Login</Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className={cn(
          "hidden sm:inline-flex",
          light && "border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
        )}
      >
        <Link href="/register">Register</Link>
      </Button>
    </>
  );
}
