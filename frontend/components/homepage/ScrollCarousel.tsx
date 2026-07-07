"use client";

import { useCallback, useEffect, useRef, useState, Children } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrollCarouselProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  gap?: number;
  showDots?: boolean;
  arrowClassName?: string;
}

export function ScrollCarousel({
  children,
  className,
  itemClassName = "w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]",
  gap = 16,
  showDots = true,
  arrowClassName,
}: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
    const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
    setPageCount(pages);
    setActivePage(Math.round(scrollLeft / clientWidth));
  }, []);

  useEffect(() => {
    updateState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [updateState, children]);

  function scrollByPage(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  const items = Children.toArray(children);

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto pb-2"
        style={{ gap }}
      >
        {items.map((child, i) => (
          <div key={i} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className={cn("h-9 w-9 rounded-full", arrowClassName)}
          disabled={!canPrev}
          onClick={() => scrollByPage(-1)}
          aria-label="Previous"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {showDots && pageCount > 1 ? (
          <div className="flex gap-1.5">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  activePage === i ? "w-6 bg-primary" : "w-2 bg-slate-300"
                )}
                onClick={() => {
                  const el = trackRef.current;
                  if (!el) return;
                  el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                }}
              />
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          size="icon"
          variant="outline"
          className={cn("h-9 w-9 rounded-full", arrowClassName)}
          disabled={!canNext}
          onClick={() => scrollByPage(1)}
          aria-label="Next"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
