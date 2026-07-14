"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { MenuItemNode } from "@/types/menu";
import type { PublicSiteSettings } from "@/types/settings";
import type { FooterDestinationLink } from "@/lib/site/public-data";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteBrandingStyles } from "@/components/site/SiteBrandingStyles";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteIntegrations } from "@/components/site/SiteIntegrations";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";
import { Button } from "@/components/ui/button";

interface AccountShellProps {
  settings: PublicSiteSettings;
  headerMenu: MenuItemNode[];
  footerMenu: MenuItemNode[];
  mobileMenu: MenuItemNode[];
  mediaMap: Record<string, string>;
  destinationLinks: FooterDestinationLink[];
  children: React.ReactNode;
}

export function AccountShell({
  settings,
  headerMenu,
  footerMenu,
  mobileMenu,
  mediaMap,
  destinationLinks,
  children,
}: AccountShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <SiteBrandingStyles branding={settings.branding} className="flex min-h-screen flex-col bg-white">
      <SiteHeader
        settings={settings}
        menu={headerMenu}
        mobileMenu={mobileMenu}
        mediaMap={mediaMap}
      />

      <div className="flex flex-1 bg-slate-50">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-50 p-4 lg:block">
          <div className="sticky top-24 rounded-2xl border bg-white p-4 shadow-sm">
            <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              My Account
            </p>
            <AccountSidebar />
          </div>
        </aside>

        {mobileNavOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold">My Account</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <AccountSidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="border-b bg-white px-4 py-3 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Account menu
            </Button>
          </div>

          <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        </div>
      </div>

      <SiteFooter
        settings={settings}
        menu={footerMenu}
        mediaMap={mediaMap}
        destinationLinks={destinationLinks}
      />
      {settings.integrations.whatsappWidget && settings.social.whatsapp ? (
        <WhatsAppWidget phone={settings.social.whatsapp} />
      ) : null}
      <SiteIntegrations integrations={settings.integrations} />
      <BackToTop />
    </SiteBrandingStyles>
  );
}
