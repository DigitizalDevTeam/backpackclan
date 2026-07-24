"use client";

import { cn } from "@/lib/utils";
import type { ResolvedMemories, ResolvedMemory } from "@/lib/site/home-categories";

const DEFAULT_ITEMS: (ResolvedMemory & { rotate: string })[] = [
  {
    id: "m1",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=85",
    caption: "Spiti nights",
    rotate: "-rotate-2",
  },
  {
    id: "m2",
    src: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=85",
    caption: "Ladakh passes",
    rotate: "rotate-1",
  },
  {
    id: "m3",
    src: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=85",
    caption: "Trail crew",
    rotate: "-rotate-1",
  },
  {
    id: "m4",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=85",
    caption: "Summit views",
    rotate: "rotate-2",
  },
  {
    id: "m5",
    src: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=85",
    caption: "Bhutan trails",
    rotate: "-rotate-2",
  },
  {
    id: "m6",
    src: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=85",
    caption: "Road stories",
    rotate: "rotate-1",
  },
];

const ROTATIONS = DEFAULT_ITEMS.map((m) => m.rotate);

export function HomeMemoriesSection({
  memories,
}: {
  memories?: ResolvedMemories | null;
}) {
  const eyebrow = memories?.eyebrow || "Postcards of memories";
  const title = memories?.title || "Moments from the road";
  const description =
    memories?.description ||
    "Real frames from our batches — polaroids worth pinning to the fridge.";

  const sourceItems =
    memories?.items && memories.items.length >= 1
      ? memories.items.slice(0, 6)
      : DEFAULT_ITEMS;

  const items = sourceItems.map((img, i) => ({
    ...img,
    rotate: ROTATIONS[i % ROTATIONS.length],
    caption: img.caption || DEFAULT_ITEMS[i % DEFAULT_ITEMS.length].caption,
  }));

  return (
    <section className="site-section overflow-hidden bg-[#FFFBF5]">
      <div className="site-container">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-400">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-5 sm:gap-7 md:gap-8">
          {items.map((item, index) => (
            <figure
              key={item.id}
              className={cn(
                "group w-[44%] max-w-[210px] transition duration-500 ease-out hover:-translate-y-3 hover:rotate-0 hover:scale-[1.03] sm:w-[30%] sm:max-w-[230px] md:w-[15%] md:max-w-none",
                item.rotate,
                index % 2 === 1 && "mt-4 sm:mt-8"
              )}
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <div className="rounded-[2px] bg-white p-2.5 pb-8 shadow-[0_12px_28px_-8px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 transition duration-500 group-hover:shadow-[0_22px_40px_-12px_rgba(245,130,32,0.35)] group-hover:ring-[#F58220]/25">
                <div className="relative overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.caption}
                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                </div>
                <figcaption className="mt-3 text-center font-serif text-xs italic tracking-wide text-slate-600 transition group-hover:text-[#F58220]">
                  {item.caption}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
