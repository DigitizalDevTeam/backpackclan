import Link from "next/link";
import type { ResolvedCategory, ResolvedDestination } from "@/lib/site/home-categories";

export function HomeCategoryNav({
  destinations,
  categories,
}: {
  destinations: ResolvedDestination[];
  categories: ResolvedCategory[];
}) {
  return (
    <section className="site-section bg-white">
      <div className="site-container">
        <p className="mb-5 text-center text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Popular destinations
        </p>
        <div className="scrollbar-hide flex justify-start gap-5 overflow-x-auto pb-2 sm:justify-center sm:gap-8">
          {destinations.map((d) => (
            <Link
              key={`${d.name}-${d.href}`}
              href={d.href}
              className="group flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-[84px]"
            >
              <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-orange-100 transition group-hover:ring-[#F58220] sm:h-[84px] sm:w-[84px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <span className="text-center text-xs font-semibold text-slate-700 group-hover:text-[#F58220]">
                {d.name}
              </span>
            </Link>
          ))}
        </div>

        {categories.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#${c.slug}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:border-[#F58220] hover:bg-[#FFF7ED] hover:text-[#F58220]"
              >
                {c.title}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
