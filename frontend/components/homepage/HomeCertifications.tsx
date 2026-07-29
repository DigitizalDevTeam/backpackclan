import type { ResolvedAccreditations } from "@/lib/site/home-categories";

const FALLBACK_LOGOS: Record<string, string> = {
  google: "/certifications/google.svg",
  tripadvisor: "/certifications/tripadvisor.svg",
  "startup-india": "/certifications/startup-india.svg",
  msme: "/certifications/msme.svg",
  uttarakhand: "/certifications/uttarakhand-tourism.svg",
  "tripadvisor-choice": "/certifications/tripadvisor-travelers-choice.svg",
};

const DEFAULT_ITEMS = [
  { id: "google", label: "Google", sublabel: "", logoUrl: FALLBACK_LOGOS.google },
  { id: "tripadvisor", label: "TripAdvisor", sublabel: "", logoUrl: FALLBACK_LOGOS.tripadvisor },
  {
    id: "startup-india",
    label: "Startup India",
    sublabel: "",
    logoUrl: FALLBACK_LOGOS["startup-india"],
  },
  { id: "msme", label: "MSME", sublabel: "", logoUrl: FALLBACK_LOGOS.msme },
  {
    id: "uttarakhand",
    label: "Uttarakhand Tourism",
    sublabel: "",
    logoUrl: FALLBACK_LOGOS.uttarakhand,
  },
  {
    id: "tripadvisor-choice",
    label: "Travelers' Choice",
    sublabel: "",
    logoUrl: FALLBACK_LOGOS["tripadvisor-choice"],
  },
];

function logoSize(id: string): string {
  if (id === "startup-india") return "h-8 w-auto max-w-[132px] sm:h-9";
  if (id === "uttarakhand") return "h-10 w-auto max-w-[110px] sm:h-11";
  if (id === "google" || id === "tripadvisor") return "h-10 w-10 sm:h-11 sm:w-11";
  if (id === "msme" || id === "tripadvisor-choice") return "h-11 w-11 sm:h-12 sm:w-12";
  return "h-10 w-auto max-w-[120px]";
}

export function HomeCertifications({
  accreditations,
}: {
  accreditations?: ResolvedAccreditations | null;
}) {
  const eyebrow = accreditations?.eyebrow?.trim() || "Trust & branding";
  const title = accreditations?.title?.trim() || "Officially recognized";
  const items =
    accreditations?.items && accreditations.items.length > 0
      ? accreditations.items.map((item) => ({
          id: item.id,
          label: item.label,
          sublabel: item.sublabel,
          logoUrl: item.logoUrl || FALLBACK_LOGOS[item.id] || null,
        }))
      : DEFAULT_ITEMS;

  return (
    <section className="site-section border-y border-slate-100 bg-[#FFFBF5]">
      <div className="site-container">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            {title}
          </h2>
        </div>

        <ul className="mt-8 flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-12 lg:gap-x-14">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex w-[140px] flex-col items-center gap-3 text-center sm:w-[150px]"
            >
              <div className="flex h-16 w-full items-center justify-center">
                {item.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.logoUrl}
                    alt={item.label}
                    className={`object-contain transition duration-300 hover:scale-105 ${logoSize(item.id)}`}
                  />
                ) : null}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {item.label}
              </p>
              {item.sublabel ? (
                <p className="-mt-2 text-[10px] text-slate-400">{item.sublabel}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
