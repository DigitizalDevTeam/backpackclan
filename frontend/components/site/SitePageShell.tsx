import { getSiteLayoutData } from "@/lib/site/public-data";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BackToTop } from "@/components/site/BackToTop";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";
import { SiteBrandingStyles } from "@/components/site/SiteBrandingStyles";
import { SiteIntegrations } from "@/components/site/SiteIntegrations";
import { MaintenanceScreen } from "@/components/site/MaintenanceScreen";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { getPageJsonLd } from "@/lib/site/seo-metadata";

interface SitePageShellProps {
  children: React.ReactNode;
  /** Optional SEO page key for JSON-LD schema injection */
  seoPageKey?: string;
}

export async function SitePageShell({ children, seoPageKey }: SitePageShellProps) {
  const layout = await getSiteLayoutData();
  const { settings } = layout;
  const jsonLd = seoPageKey ? await getPageJsonLd(seoPageKey) : null;

  if (settings.maintenance.enabled) {
    return <MaintenanceScreen settings={settings} mediaMap={layout.mediaMap} />;
  }

  return (
    <SiteBrandingStyles branding={settings.branding} className="min-h-screen bg-white">
      {jsonLd ? <SiteJsonLd data={jsonLd} /> : null}
      <SiteHeader
        settings={settings}
        menu={layout.headerMenu}
        mobileMenu={layout.mobileMenu}
        mediaMap={layout.mediaMap}
      />
      <main>{children}</main>
      <SiteFooter
        settings={settings}
        menu={layout.footerMenu}
        mediaMap={layout.mediaMap}
        destinationLinks={layout.destinationLinks}
      />
      {settings.integrations.whatsappWidget && settings.social.whatsapp ? (
        <WhatsAppWidget phone={settings.social.whatsapp} />
      ) : null}
      <SiteIntegrations integrations={settings.integrations} />
      <BackToTop />
    </SiteBrandingStyles>
  );
}
