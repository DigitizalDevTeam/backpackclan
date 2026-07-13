"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { HeroSearchBar } from "@/components/homepage/homepage-parts";
import type { ResolvedHero } from "@/lib/site/home-categories";
import { cn } from "@/lib/utils";

export function HeroVideoBanner({ hero }: { hero: ResolvedHero }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const isVideo = hero.mediaType === "video" && !!hero.mediaUrl;
  const poster = hero.posterUrl ?? "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    const onReady = () => setReady(true);
    if (video.readyState >= 2) onReady();
    video.addEventListener("loadeddata", onReady);
    video.play().catch(() => undefined);
    return () => video.removeEventListener("loadeddata", onReady);
  }, [isVideo, hero.mediaUrl]);

  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="relative min-h-[70vh] sm:min-h-[78vh] lg:min-h-[85vh]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              isVideo && ready ? "opacity-0" : "opacity-100"
            )}
          />
        ) : null}

        {isVideo ? (
          <video
            ref={videoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              ready ? "opacity-100" : "opacity-0"
            )}
            autoPlay
            muted
            loop
            playsInline
            poster={poster || undefined}
            aria-hidden
          >
            <source src={hero.mediaUrl!} type="video/mp4" />
          </video>
        ) : hero.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.mediaUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:min-h-[78vh] lg:min-h-[85vh]">
          <p className="homepage-fade-up text-xs font-bold uppercase tracking-[0.28em] text-[#FFD200]">
            {hero.eyebrow}
          </p>
          <h1 className="homepage-fade-up mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl [animation-delay:80ms]">
            {hero.headline}
          </h1>
          <p className="homepage-fade-up mt-4 max-w-xl text-base text-white/80 sm:text-lg [animation-delay:140ms]">
            {hero.subheadline}
          </p>
          <HeroSearchBar className="mt-8" />
          <div className="homepage-fade-up mt-6 flex flex-col gap-3 sm:flex-row [animation-delay:220ms]">
            {hero.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.url}`}
                href={cta.url}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold uppercase tracking-wide transition",
                  cta.style === "primary" || cta.style === "secondary"
                    ? "bg-[#FFD200] text-black hover:bg-[#F58220] hover:text-white"
                    : "border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-black"
                )}
              >
                {cta.label}
                {(cta.style === "primary" || cta.style === "secondary") && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-6 px-4 sm:-mt-8">
        <div className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-xl sm:grid-cols-3">
          {[
            { label: "Google", rating: "4.8" },
            { label: "TripAdvisor", rating: "4.9" },
            { label: "Happy Travelers", rating: "12K+" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                <Star className="h-5 w-5 fill-[#F58220] text-[#F58220]" />
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-slate-900">{item.rating}</p>
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
