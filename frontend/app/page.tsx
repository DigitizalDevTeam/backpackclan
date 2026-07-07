import type { Metadata } from "next";
import { HomepageRenderer } from "@/components/homepage/HomepageRenderer";
import { BackToTop } from "@/components/site/BackToTop";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppWidget } from "@/components/site/WhatsAppWidget";
import { getHomepageData } from "@/lib/site/public-data";

export const metadata: Metadata = {
  title: "Backpackclan — Adventure Tours in the Himalayas",
  description:
    "Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal. Book your Himalayan adventure today.",
  openGraph: {
    title: "Backpackclan — Adventure Tours in the Himalayas",
    description:
      "Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal.",
    type: "website",
  },
};

export default function HomePage() {
  const data = getHomepageData();

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader settings={data.settings} menu={data.headerMenu} />
      <main>
        <HomepageRenderer
          sections={data.sections}
          mediaMap={data.mediaMap}
          trips={data.trips}
          secondaryBanner={data.secondaryBanner}
        />
      </main>
      <SiteFooter settings={data.settings} menu={data.footerMenu} />
      <WhatsAppWidget phone={data.settings.social.whatsapp} />
      <BackToTop />
    </div>
  );
}
