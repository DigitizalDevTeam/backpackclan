const BADGES = [
  {
    id: "msme",
    label: "MSME Registered",
    sublabel: "Government of India",
    accent: "from-blue-600 to-blue-800",
  },
  {
    id: "uttarakhand",
    label: "Uttarakhand Tourism",
    sublabel: "Recognized operator",
    accent: "from-emerald-600 to-teal-700",
  },
  {
    id: "startup-india",
    label: "Startup India",
    sublabel: "DPIIT recognized",
    accent: "from-orange-500 to-amber-600",
  },
  {
    id: "tripadvisor",
    label: "Travelers' Choice",
    sublabel: "TripAdvisor Award",
    accent: "from-[#34E0A1] to-[#00AF87]",
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
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-6 text-center shadow-sm"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${badge.accent} text-xs font-bold uppercase tracking-wide text-white shadow-md`}
              >
                {badge.id === "tripadvisor" ? "TA" : badge.label.split(" ")[0].slice(0, 4)}
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
