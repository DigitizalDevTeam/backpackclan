import Link from "next/link";
import { CreditCard, Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon, socialHref } from "@/components/site/SocialIcon";
import { SiteLogo } from "@/components/site/SiteLogo";
import { RichTextContent } from "@/components/site/RichTextContent";
import type { MenuItemNode } from "@/types/menu";
import type { PublicSiteSettings } from "@/types/settings";
import type { FooterDestinationLink } from "@/lib/site/public-data";
import { Separator } from "@/components/ui/separator";

interface SiteFooterProps {
  settings: PublicSiteSettings;
  menu: MenuItemNode[];
  mediaMap?: Record<string, string>;
  destinationLinks?: FooterDestinationLink[];
}

export function SiteFooter({
  settings,
  menu,
  mediaMap = {},
  destinationLinks = [],
}: SiteFooterProps) {
  const { general, social, footer } = settings;

  const isLegalLink = (url: string) =>
    ["/privacy", "/terms", "/privacy-policy", "/terms-conditions"].includes(url) ||
    url.includes("privacy") ||
    url.includes("terms");

  const legalLinks = menu.filter((item) => isLegalLink(item.url));
  const quickLinks = menu.filter((item) => !isLegalLink(item.url));

  return (
    <footer className="bg-[#0c0c0c] text-zinc-300">
      <div className="site-container py-10 sm:py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <SiteLogo
              siteName={general.siteName}
              logoId={general.logoId}
              mediaMap={mediaMap}
              showTagline={false}
              className="mb-4"
              imageClassName="h-11 w-auto max-w-[180px]"
            />
            <RichTextContent
              html={footer.description}
              className="text-sm leading-relaxed text-zinc-400 [&_p]:text-zinc-400"
            />
            {footer.showPaymentIcons ? (
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                <CreditCard className="h-4 w-4" />
                <span>Secure payments via UPI, Cards & Net Banking</span>
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <Link href={item.url} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {destinationLinks.length > 0 ? (
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Popular Destinations
              </h3>
              <ul className="space-y-2 text-sm">
                {destinationLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              {general.address ? (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{general.address}</span>
                </li>
              ) : null}
              {general.contactPhone ? (
                <li>
                  <a href={`tel:${general.contactPhone}`} className="flex items-center gap-2 hover:text-white">
                    <Phone className="h-4 w-4 text-primary" />
                    {general.contactPhone}
                  </a>
                </li>
              ) : null}
              {general.contactEmail ? (
                <li>
                  <a href={`mailto:${general.contactEmail}`} className="flex items-center gap-2 hover:text-white">
                    <Mail className="h-4 w-4 text-primary" />
                    {general.contactEmail}
                  </a>
                </li>
              ) : null}
            </ul>
            <div className="mt-5 flex gap-3">
              {social.facebook?.trim() ? (
                <a
                  href={socialHref("facebook", social.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full bg-slate-800 p-2 hover:bg-primary"
                >
                  <SocialIcon network="facebook" />
                </a>
              ) : null}
              {social.instagram?.trim() ? (
                <a
                  href={socialHref("instagram", social.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full bg-slate-800 p-2 hover:bg-primary"
                >
                  <SocialIcon network="instagram" />
                </a>
              ) : null}
              {social.youtube?.trim() ? (
                <a
                  href={socialHref("youtube", social.youtube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="rounded-full bg-slate-800 p-2 hover:bg-primary"
                >
                  <SocialIcon network="youtube" />
                </a>
              ) : null}
              {social.linkedin?.trim() ? (
                <a
                  href={socialHref("linkedin", social.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-full bg-slate-800 p-2 hover:bg-primary"
                >
                  <SocialIcon network="linkedin" />
                </a>
              ) : null}
              {social.whatsapp?.trim() ? (
                <a
                  href={socialHref("whatsapp", social.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="rounded-full bg-slate-800 p-2 hover:bg-primary"
                >
                  <SocialIcon network="whatsapp" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-slate-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-500 sm:flex-row">
          <p>{footer.copyright}</p>
          {legalLinks.length > 0 ? (
            <div className="flex gap-4">
              {legalLinks.map((item) => (
                <Link key={item.id} href={item.url} className="hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
