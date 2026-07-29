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
  showArrows?: boolean;
  /** Auto-advance interval in ms. Set false/0 to disable. */
  autoplay?: number | false;
  arrowClassName?: string;
}

export function ScrollCarousel({
  children,
  className,
  itemClassName = "w-[85%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]",
  gap = 16,
  showDots = true,
  showArrows = true,
  autoplay = false,
  arrowClassName,
}: ScrollCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [paused, setPaused] = useState(false);

  const updateState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 4);
    const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
    setPageCount(pages);
    setActivePage(Math.min(pages - 1, Math.round(scrollLeft / Math.max(clientWidth, 1))));
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

  function scrollToPage(page: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (!autoplay || pageCount <= 1 || paused) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: clientWidth * 0.9, behavior: "smooth" });
      }
    }, autoplay);
    return () => window.clearInterval(id);
  }, [autoplay, pageCount, paused, children]);

  const items = Children.toArray(children);
  const showControls = showArrows || (showDots && pageCount > 1);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
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

      {showControls ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          {showArrows ? (
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
          ) : null}

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
                  onClick={() => scrollToPage(i)}
                />
              ))}
            </div>
          ) : null}

          {showArrows ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
