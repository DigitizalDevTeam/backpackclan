"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import type { PublicTrip } from "@/types/trip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DestinationOption {
  name: string;
  slug: string;
  tripCount?: number;
}

interface SearchSuggestion {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  type: "destination" | "trip";
}

export function DestinationTripSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [destRes, tripRes] = await Promise.all([
          fetch("/api/public/destinations"),
          fetch("/api/public/trips?per_page=48"),
        ]);
        const destData = await destRes.json();
        const tripData = await tripRes.json();

        if (destData.success && Array.isArray(destData.data)) {
          setDestinations(
            destData.data.map((d: { name: string; slug: string; tripCount?: number }) => ({
              name: d.name,
              slug: d.slug,
              tripCount: d.tripCount,
            }))
          );
        }

        if (tripData.success) {
          const items = tripData.data?.items ?? tripData.data ?? [];
          if (Array.isArray(items)) {
            setTrips(items);
          }
        }
      } catch {
        // suggestions optional
      }
    }
    load();
  }, []);

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const destMatches = destinations
      .filter((d) => d.name.toLowerCase().includes(q) || d.slug.replace(/-/g, " ").includes(q))
      .slice(0, 4)
      .map((d) => ({
        id: `dest-${d.slug}`,
        label: d.name,
        sublabel:
          typeof d.tripCount === "number"
            ? `${d.tripCount} trip${d.tripCount === 1 ? "" : "s"}`
            : "Destination",
        href: `/trips?destination=${encodeURIComponent(d.slug)}`,
        type: "destination" as const,
      }));

    const tripMatches = trips
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q) ||
          t.slug.replace(/-/g, " ").includes(q)
      )
      .slice(0, 8)
      .map((t) => ({
        id: `trip-${t.slug}`,
        label: t.title,
        sublabel: t.destination,
        href: `/trips/${t.slug}`,
        type: "trip" as const,
      }));

    return [...destMatches, ...tripMatches];
  }, [query, destinations, trips]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [close]);

  useEffect(() => {
    setActiveIndex(0);
  }, [suggestions.length, query]);

  function goTo(href: string) {
    close();
    setQuery("");
    router.push(href);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions[activeIndex]) {
      goTo(suggestions[activeIndex].href);
      return;
    }
    const q = query.trim();
    if (!q) {
      router.push("/trips");
      return;
    }
    router.push(`/trips?search=${encodeURIComponent(q)}`);
    close();
  }

  return (
    <div ref={containerRef} className={cn("relative mx-auto w-full max-w-2xl", className)}>
      <form
        onSubmit={onSubmit}
        className="homepage-fade-up rounded-2xl border border-white/25 bg-white p-2 shadow-2xl shadow-black/25 [animation-delay:180ms]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <label className="relative flex flex-1 cursor-text items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
              <MapPin className="h-4 w-4 text-[#F58220]" />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={(e) => {
                  if (!open || !suggestions.length) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((i) => (i + 1) % suggestions.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === "Escape") {
                    close();
                  }
                }}
                placeholder="Search Trips..."
                autoComplete="off"
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
            </span>
          </label>

          <Button
            type="submit"
            size="lg"
            className="h-auto rounded-xl bg-[#F58220] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#e07418]"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      {open && suggestions.length > 0 ? (
        <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          {suggestions.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => goTo(item.href)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition",
                  index === activeIndex ? "bg-orange-50" : "hover:bg-slate-50"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    item.type === "destination"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-emerald-50 text-emerald-700"
                  )}
                >
                  {item.type === "destination" ? "Place" : "Trip"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">
                    {item.label}
                  </span>
                  {item.sublabel ? (
                    <span className="block truncate text-xs text-slate-500">{item.sublabel}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
