interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
}

export function PageHero({ title, subtitle, badge, imageUrl }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-16 text-white sm:py-20">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/50" />
        </>
      ) : (
        <div className="homepage-pattern absolute inset-0 opacity-20" />
      )}
      <div className="relative mx-auto max-w-7xl px-4">
        {badge ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">
            {badge}
          </p>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-lg text-slate-300">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
