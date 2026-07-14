"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Mail,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { SocialIcon, socialHref } from "@/components/site/SocialIcon";
import { SiteLogo } from "@/components/site/SiteLogo";
import type { MenuItemNode } from "@/types/menu";
import type { PublicSiteSettings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HeaderAuthMenu } from "@/components/site/HeaderAuthMenu";
import { hexToRgb } from "@/lib/site/branding";

interface SiteHeaderProps {
  settings: PublicSiteSettings;
  menu: MenuItemNode[];
  mobileMenu?: MenuItemNode[];
  mediaMap?: Record<string, string>;
}

function NavLinks({
  items,
  onNavigate,
}: {
  items: MenuItemNode[];
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) =>
        item.children.length > 0 ? (
          <DropdownMenu key={item.id}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-[#F58220]">
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.id} asChild>
                  <Link href={child.url} onClick={onNavigate}>
                    {child.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            key={item.id}
            href={item.url}
            onClick={onNavigate}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50 hover:text-[#F58220]"
          >
            {item.label}
          </Link>
        )
      )}
    </>
  );
}

function MobileNavLinks({
  items,
  onNavigate,
}: {
  items: MenuItemNode[];
  onNavigate: () => void;
}) {
  return (
    <>
      {items.map((item) => (
        <div key={item.id}>
          <Link
            href={item.url}
            className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-orange-50"
            onClick={onNavigate}
          >
            {item.label}
          </Link>
          {item.children.length > 0 ? (
            <div className="ml-4 space-y-1 border-l pl-2">
              {item.children.map((child) => (
                <Link
                  key={child.id}
                  href={child.url}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-orange-50 hover:text-foreground"
                  onClick={onNavigate}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </>
  );
}

export function SiteHeader({
  settings,
  menu,
  mobileMenu,
  mediaMap = {},
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { general, social, branding } = settings;
  const drawerMenu = mobileMenu?.length ? mobileMenu : menu;
  const primaryRgb = hexToRgb(branding.primaryColor);

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
      <div
        className="hidden border-b text-white md:block"
        style={{
          backgroundColor: branding.primaryColor,
          borderColor: primaryRgb ? `rgb(${primaryRgb} / 0.8)` : undefined,
        }}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs opacity-90">
          <div className="flex items-center gap-4">
            {general.contactPhone ? (
              <a href={`tel:${general.contactPhone}`} className="flex items-center gap-1 hover:text-white">
                <Phone className="h-3 w-3" />
                {general.contactPhone}
              </a>
            ) : null}
            {general.contactEmail ? (
              <a href={`mailto:${general.contactEmail}`} className="flex items-center gap-1 hover:text-white">
                <Mail className="h-3 w-3" />
                {general.contactEmail}
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {social.facebook?.trim() ? (
              <a
                href={socialHref("facebook", social.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <SocialIcon network="facebook" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.instagram?.trim() ? (
              <a
                href={socialHref("instagram", social.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <SocialIcon network="instagram" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.youtube?.trim() ? (
              <a
                href={socialHref("youtube", social.youtube)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <SocialIcon network="youtube" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.linkedin?.trim() ? (
              <a
                href={socialHref("linkedin", social.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <SocialIcon network="linkedin" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
            {social.whatsapp?.trim() ? (
              <a
                href={socialHref("whatsapp", social.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <SocialIcon network="whatsapp" className="h-3.5 w-3.5 hover:text-white" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b border-slate-100 bg-white py-2 transition-shadow duration-300 sm:py-3",
          scrolled && "shadow-md"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16">
          <SiteLogo
            siteName={general.siteName}
            tagline={general.tagline}
            logoId={general.logoId}
            mediaMap={mediaMap}
          />

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLinks items={menu} />
          </nav>

          <div className="flex items-center gap-2">
            <HeaderAuthMenu />
            <Button
              asChild
              className="hidden rounded-full bg-[#FFD200] px-5 font-bold text-black hover:bg-[#F58220] hover:text-white sm:inline-flex"
            >
              <Link href="/contact">Plan My Trip</Link>
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn("border-b bg-white lg:hidden", mobileOpen ? "block" : "hidden")}>
        <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
          <MobileNavLinks items={drawerMenu} onNavigate={() => setMobileOpen(false)} />
          <Button
            asChild
            className="mt-2 w-full rounded-full bg-[#FFD200] font-bold text-black hover:bg-[#F58220] hover:text-white"
          >
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
        </nav>
      </div>
    </header>
  );
}
