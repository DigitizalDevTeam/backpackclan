import type { ResolvedAccreditations } from "@/lib/site/home-categories";

function logoClassName(id: string): string {
  if (id === "startup-india") {
    return "h-10 w-auto max-w-[150px] sm:h-11";
  }
  if (id === "tripadvisor") {
    return "h-14 w-auto max-w-[72px] sm:h-16";
  }
  return "h-14 w-auto max-w-[140px] sm:h-16";
}

export function HomeCertifications({
  accreditations,
}: {
  accreditations: ResolvedAccreditations;
}) {
  return (
    <section className="border-y border-slate-100 bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
          {accreditations.eyebrow}
        </p>
        <h2 className="mt-2 text-center font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          {accreditations.title}
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {accreditations.items.map((badge) => (
            <div
              key={badge.id}
              className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white px-4 py-6 text-center shadow-sm"
            >
              <div className="flex h-14 w-full items-center justify-center sm:h-16">
                {badge.logoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={badge.logoUrl}
                    alt={badge.label}
                    className={`object-contain ${logoClassName(badge.id)}`}
                  />
                ) : null}
              </div>
              <p className="mt-4 text-sm font-bold text-slate-900">{badge.label}</p>
              {badge.sublabel ? (
                <p className="mt-1 text-xs text-slate-500">{badge.sublabel}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
