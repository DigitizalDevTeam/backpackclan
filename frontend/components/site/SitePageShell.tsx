import { getSiteLayoutData } from "@/lib/site/public-data";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BackToTop } from "@/components/site/BackToTop";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";

interface SitePageShellProps {
  children: React.ReactNode;
}

export function SitePageShell({ children }: SitePageShellProps) {
  const layout = getSiteLayoutData();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader settings={layout.settings} menu={layout.headerMenu} />
      <main>{children}</main>
      <SiteFooter settings={layout.settings} menu={layout.footerMenu} />
      <WhatsAppWidget phone={layout.settings.social.whatsapp} />
      <BackToTop />
    </div>
  );
}
