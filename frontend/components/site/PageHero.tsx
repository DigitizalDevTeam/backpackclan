interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  imageUrl?: string;
}

export function PageHero({ title, subtitle, badge, imageUrl }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0c0c0c] py-16 text-white sm:py-20">
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
        </>
      ) : (
        <>
          <div className="homepage-pattern absolute inset-0 opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,130,32,0.25),transparent_55%)]" />
        </>
      )}
      <div className="relative mx-auto max-w-7xl px-4">
        {badge ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFD200]">
            {badge}
          </p>
        ) : null}
        <h1 className="max-w-3xl font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-lg text-white/70">{subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}
