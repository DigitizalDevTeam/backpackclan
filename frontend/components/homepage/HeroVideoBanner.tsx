"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { DestinationTripSearchBar } from "@/components/homepage/DestinationTripSearchBar";
import { HomeTrustStrip } from "@/components/homepage/HomeTrustStrip";
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
    <section className="relative overflow-hidden bg-slate-950 text-white">
      {/* Full-bleed cinematic hero — header overlays this plane */}
      <div className="relative min-h-[100svh] sm:min-h-[92vh] lg:min-h-[100vh]">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              isVideo && ready ? "opacity-0" : "opacity-100",
              !isVideo && "homepage-hero-bg"
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
            className="homepage-hero-bg absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        {/* Depth overlays — stronger at top for header contrast */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

        <div className="relative z-10 site-container flex min-h-[100svh] flex-col items-center justify-center pb-28 pt-28 text-center sm:min-h-[92vh] sm:pb-32 sm:pt-32 lg:min-h-[100vh]">
          <p className="homepage-fade-up text-[11px] font-bold uppercase tracking-[0.32em] text-[#FFD200] sm:text-xs">
            {hero.eyebrow}
          </p>
          <h1 className="homepage-fade-up mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl [animation-delay:80ms]">
            {hero.headline}
          </h1>
          <p className="homepage-fade-up mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg [animation-delay:140ms]">
            {hero.subheadline}
          </p>

          <DestinationTripSearchBar className="mt-10 w-full" />

          <div className="homepage-fade-up mt-7 flex flex-col gap-3 sm:flex-row [animation-delay:220ms]">
            {hero.ctas.map((cta) => (
              <Link
                key={`${cta.label}-${cta.url}`}
                href={cta.url}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold uppercase tracking-wide transition",
                  cta.style === "primary" || cta.style === "secondary"
                    ? "bg-[#FFD200] text-black hover:bg-[#F58220] hover:text-white"
                    : "border-2 border-white/70 bg-transparent text-white backdrop-blur-sm hover:bg-white hover:text-black"
                )}
              >
                {cta.label}
                {(cta.style === "primary" || cta.style === "secondary") && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Link>
            ))}
          </div>

          <a
            href="#categories"
            className="homepage-fade-up mt-12 flex flex-col items-center gap-1 text-white/55 transition hover:text-white [animation-delay:400ms]"
            aria-label="Scroll to explore"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Explore</span>
            <ChevronDown className="homepage-scroll-dot h-5 w-5" />
          </a>
        </div>
      </div>

      <HomeTrustStrip />
    </section>
  );
}
