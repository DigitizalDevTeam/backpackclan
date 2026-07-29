"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ScrollCarousel } from "@/components/homepage/ScrollCarousel";
import type { ResolvedOffer } from "@/lib/site/home-categories";

function OfferBannerCard({ offer }: { offer: ResolvedOffer }) {
  return (
    <Link
      href={offer.href}
      className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow-md ring-1 ring-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[5/2] sm:aspect-[3/1]">
        {offer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-center p-5 sm:p-6">
          <span className="mb-2 inline-flex w-fit rounded-full bg-[#F58220] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {offer.badge}
          </span>
          <h3 className="font-display text-lg font-semibold leading-snug text-white sm:text-xl">
            {offer.headline}
          </h3>
          {offer.subheadline ? (
            <p className="mt-1 line-clamp-2 text-xs text-white/75 sm:text-sm">
              {offer.subheadline}
            </p>
          ) : null}
          <span className="mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#FFD200] transition group-hover:gap-2">
            {offer.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomePromoBanners({ offers }: { offers: ResolvedOffer[] }) {
  if (!offers.length) return null;

  return (
    <section className="site-section bg-white">
      <div className="site-container">
        {offers.length === 1 ? (
          <OfferBannerCard offer={offers[0]} />
        ) : (
          <ScrollCarousel
            itemClassName="w-[92%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(50%-8px)]"
            showArrows={false}
            autoplay={4500}
          >
            {offers.map((offer) => (
              <OfferBannerCard key={offer.id} offer={offer} />
            ))}
          </ScrollCarousel>
        )}
      </div>
    </section>
  );
}
