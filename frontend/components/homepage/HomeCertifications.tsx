const BADGES = [
  {
    id: "msme",
    label: "MSME Registered",
    sublabel: "Government of India",
    logoSrc: "/certifications/msme.svg",
    logoClassName: "h-14 w-auto max-w-[140px] sm:h-16",
  },
  {
    id: "uttarakhand",
    label: "Uttarakhand Tourism",
    sublabel: "Recognized operator",
    logoSrc: "/certifications/uttarakhand-tourism.svg",
    logoClassName: "h-14 w-auto max-w-[140px] sm:h-16",
  },
  {
    id: "startup-india",
    label: "Startup India",
    sublabel: "DPIIT recognized",
    logoSrc: "/certifications/startup-india.svg",
    logoClassName: "h-10 w-auto max-w-[150px] sm:h-11",
  },
  {
    id: "tripadvisor",
    label: "Travelers' Choice",
    sublabel: "TripAdvisor Award",
    logoSrc: "/certifications/tripadvisor-travelers-choice.svg",
    logoClassName: "h-14 w-auto max-w-[72px] sm:h-16",
  },
] as const;

export function HomeCertifications() {
  return (
    <section className="border-y border-slate-100 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
          Accreditations
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          Trusted &amp; certified
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {BADGES.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm"
            >
              <div className="flex h-14 w-full items-center justify-center sm:h-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.logoSrc}
                  alt={badge.label}
                  className={`object-contain ${badge.logoClassName}`}
                />
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900">{badge.label}</p>
              <p className="mt-1 text-xs text-slate-500">{badge.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
