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

export function AuthPageLayout({
  title,
  subtitle,
  asideTitle,
  asidePoints,
  children,
}: AuthPageLayoutProps) {
  const layout = getSiteLayoutData();
  const bgImage = layout.mediaMap["2"] ?? layout.mediaMap["1"];

  return (
    <SitePageShell>
      <section className="relative overflow-hidden bg-slate-100 py-10 sm:py-16">
        {bgImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bgImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-slate-100/90 to-slate-100" />
          </>
        ) : null}

        <div className="relative mx-auto max-w-5xl px-4">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
            <div className="grid lg:grid-cols-5">
              <aside className="relative hidden bg-teal-900 p-10 text-white lg:col-span-2 lg:flex lg:flex-col lg:justify-between">
                <div className="homepage-pattern absolute inset-0 opacity-20" />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">
                    Backpackclan
                  </p>
                  <h2 className="mt-4 text-2xl font-bold leading-snug">{asideTitle}</h2>
                </div>
                <ul className="relative mt-8 space-y-4">
                  {asidePoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-teal-50">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="relative mt-8 text-xs text-teal-200">
                  Curated adventures across Ladakh, Spiti, Kashmir, Bhutan & Nepal.
                </p>
              </aside>

              <div className="p-6 sm:p-10 lg:col-span-3">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
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
