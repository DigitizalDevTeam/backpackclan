import { CheckCircle2 } from "lucide-react";
import { SitePageShell } from "@/components/site/SitePageShell";
import { getSiteLayoutData } from "@/lib/site/public-data";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  asideTitle: string;
  asidePoints: string[];
  children: React.ReactNode;
}

export async function AuthPageLayout({
  title,
  subtitle,
  asideTitle,
  asidePoints,
  children,
}: AuthPageLayoutProps) {
  const layout = await getSiteLayoutData();
  const { settings, mediaMap } = layout;
  const bgImage = mediaMap["2"] ?? mediaMap["1"];
  const logoUrl = settings.general.logoId
    ? mediaMap[settings.general.logoId] ?? "/logo.png"
    : "/logo.png";

  return (
    <SitePageShell>
      <section className="relative overflow-hidden bg-[#faf8f5] py-10 sm:py-16">
        {bgImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f5]/85 via-[#faf8f5]/92 to-[#faf8f5]" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-5xl px-4">
          <div className="overflow-hidden rounded-2xl border border-[#ebe4d8] bg-white shadow-xl">
            <div className="grid lg:grid-cols-5">
              <aside className="relative hidden bg-[#111111] p-10 text-white lg:col-span-2 lg:flex lg:flex-col lg:justify-between">
                <div className="homepage-pattern absolute inset-0 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#F58220]/20 to-transparent" />
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt={settings.general.siteName}
                    className="h-12 w-auto object-contain"
                  />
                  <h2 className="mt-6 font-display text-2xl font-semibold leading-snug">
                    {asideTitle}
                  </h2>
                </div>
                <ul className="relative mt-8 space-y-4">
                  {asidePoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-white/85">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD200]" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-8 text-xs text-white/55">
                  {settings.general.tagline ||
                    "Travel · Explore · Share — adventures across India & beyond."}
                </p>
              </aside>

              <div className="p-6 sm:p-10 lg:col-span-3">
                <div className="mb-8">
                  <h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                    {title}
                  </h1>
                  <p className="mt-2 text-muted-foreground">{subtitle}</p>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SitePageShell>
  );
}
