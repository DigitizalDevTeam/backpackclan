"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Menu,
  Mountain,
  Phone,
  X,
} from "lucide-react";
import { SocialIcon } from "@/components/site/SocialIcon";
import type { MenuItemNode } from "@/types/menu";
import type { SiteSettings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HeaderAuthMenu } from "@/components/site/HeaderAuthMenu";

interface SiteHeaderProps {
  settings: SiteSettings;
  menu: MenuItemNode[];
}

export function SiteHeader({ settings, menu }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { general, social } = settings;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-teal-800 bg-teal-950 text-teal-100 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-4">
            <a href={`tel:${general.contactPhone}`} className="flex items-center gap-1 hover:text-white">
              <Phone className="h-3 w-3" />
              {general.contactPhone}
            </a>
            <a href={`mailto:${general.contactEmail}`} className="flex items-center gap-1 hover:text-white">
              <Mail className="h-3 w-3" />
              {general.contactEmail}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <SocialIcon network="facebook" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <SocialIcon network="instagram" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.youtube ? (
              <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <SocialIcon network="youtube" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.linkedin ? (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <SocialIcon network="linkedin" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b transition-all duration-300",
          scrolled
            ? "bg-white/95 shadow-md backdrop-blur-md"
            : "border-transparent bg-white shadow-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block font-bold text-foreground">{general.siteName}</span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">{general.tagline}</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {menu.map((item) =>
              item.children.length > 0 ? (
                <DropdownMenu key={item.id}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary">
                      {item.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.id} asChild>
                        <Link href={child.url}>{child.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.id}
                  href={item.url}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <HeaderAuthMenu />
            <Button
              asChild
              className="hidden bg-orange-500 hover:bg-orange-600 sm:inline-flex"
            >
              <Link href="/contact">Plan My Trip</Link>
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b bg-white lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
          {menu.map((item) => (
            <div key={item.id}>
              <Link
                href={item.url}
                className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children.length > 0 ? (
                <div className="ml-4 space-y-1 border-l pl-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={child.url}
                      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
          <Button asChild className="mt-2 w-full bg-orange-500 hover:bg-orange-600">
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              Plan My Trip
            </Link>
          </Button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button asChild className="w-full bg-primary">
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </Button>
          </div>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/account/dashboard" onClick={() => setMobileOpen(false)}>
              My Account
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
