"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { ResolvedYoutubeVideos } from "@/lib/site/home-categories";
import { cn } from "@/lib/utils";

function relativeOffset(index: number, active: number, total: number): number | null {
  if (total <= 0) return null;
  if (index === active) return 0;
  if (total === 2) {
    return index === (active + 1) % total ? 1 : null;
  }
  if (index === (active - 1 + total) % total) return -1;
  if (index === (active + 1) % total) return 1;
  return null;
}

export function HomeVideosSection({ videos }: { videos: ResolvedYoutubeVideos }) {
  const items = videos.items;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [active]);

  if (!items.length) return null;

  const total = items.length;
  const go = (dir: -1 | 1) => setActive((i) => (i + dir + total) % total);

  return (
    <section className="site-section bg-white">
      <div className="site-container">
        <div className="mb-6 text-center sm:mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            {videos.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {videos.title}
          </h2>
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="relative flex h-[200px] items-center justify-center sm:h-[280px] md:h-[340px]">
            {items.map((item, index) => {
              const offset = relativeOffset(index, active, total);
              if (offset === null) return null;

              const isCenter = offset === 0;
              const showPlayer = isCenter && playing;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "absolute overflow-hidden rounded-2xl bg-slate-900 shadow-lg transition-all duration-500 ease-out",
                    isCenter
                      ? "z-20 w-[78%] sm:w-[62%] md:w-[58%] scale-100 opacity-100"
                      : "z-10 w-[42%] sm:w-[38%] scale-[0.88] opacity-70",
                    offset === -1 && "left-0 origin-right",
                    offset === 1 && "right-0 origin-left",
                    isCenter && "left-1/2 -translate-x-1/2"
                  )}
                >
                  <div className="relative aspect-video w-full">
                    {showPlayer ? (
                      <iframe
                        title={item.title || "YouTube video"}
                        src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        className="group absolute inset-0 block w-full"
                        onClick={() => {
                          if (isCenter) setPlaying(true);
                          else setActive(index);
                        }}
                        aria-label={
                          isCenter
                            ? `Play ${item.title || "video"}`
                            : `Show ${item.title || "video"}`
                        }
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title || "YouTube video"}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
                        <span
                          className={cn(
                            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition group-hover:scale-110",
                            isCenter ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-12 sm:w-12"
                          )}
                        >
                          <Play
                            className={cn(
                              "fill-[#F58220] text-[#F58220]",
                              isCenter ? "h-6 w-6 sm:h-7 sm:w-7" : "h-4 w-4 sm:h-5 sm:w-5"
                            )}
                          />
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous video"
                className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#F58220] hover:text-[#F58220] sm:-left-2 md:-left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next video"
                className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#F58220] hover:text-[#F58220] sm:-right-2 md:-right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {total > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              {items.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to video ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === active ? "w-6 bg-[#F58220]" : "w-2 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
