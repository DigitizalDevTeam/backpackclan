"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bike,
  Calendar,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Mountain,
  Search,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { PublicTrip } from "@/types/trip";
import { formatInr } from "@/lib/site/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: PublicTrip;
  imageUrl: string | null;
  variant?: "default" | "featured";
}

const badgeStyles: Record<NonNullable<PublicTrip["badge"]>, string> = {
  Trending: "bg-orange-500 text-white",
  "Best Seller": "bg-primary text-white",
  Guaranteed: "bg-emerald-600 text-white",
  New: "bg-violet-600 text-white",
};

export function TripCard({ trip, imageUrl, variant = "default" }: TripCardProps) {
  const discount =
    trip.originalPrice && trip.originalPrice > trip.price
      ? Math.round(((trip.originalPrice - trip.price) / trip.originalPrice) * 100)
      : null;

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl",
        variant === "featured" && "lg:flex-row"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          variant === "featured" ? "aspect-[16/10] lg:aspect-auto lg:w-[45%]" : "aspect-[4/3]"
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={trip.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        {trip.badge ? (
          <Badge className={`absolute left-3 top-3 border-0 shadow-sm ${badgeStyles[trip.badge]}`}>
            {trip.badge}
          </Badge>
        ) : null}
        {discount ? (
          <span className="absolute right-3 top-3 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
            {discount}% OFF
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
          {trip.duration}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", variant === "featured" ? "p-6" : "p-4")}>
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-primary">
          <MapPin className="h-3.5 w-3.5" />
          {trip.destination}
          <span className="text-slate-300">·</span>
          <span className="text-muted-foreground">{trip.category}</span>
        </div>

        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {trip.title}
        </h3>

        <div className="mt-2.5 flex items-center gap-1.5">
          <StarRating rating={trip.rating} starClassName="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">{trip.rating}</span>
          <span className="text-xs text-muted-foreground">({trip.reviewCount} reviews)</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Starting from
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">{formatInr(trip.price)}</span>
              {trip.originalPrice ? (
                <span className="text-sm text-muted-foreground line-through">
                  {formatInr(trip.originalPrice)}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">per person · taxes extra</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-primary/90">
            View Details
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryChips() {
  const categories = [
    { label: "Bike Tours", icon: Bike, href: "/trips?category=bike-tour", color: "text-orange-500" },
    { label: "Treks", icon: Mountain, href: "/trips?category=trek", color: "text-emerald-600" },
    { label: "Group Trips", icon: Users, href: "/trips?category=group", color: "text-blue-600" },
    { label: "Weekend", icon: Calendar, href: "/trips?category=weekend", color: "text-violet-600" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
      {categories.map(({ label, icon: Icon, href, color }) => (
        <Link
          key={label}
          href={href}
          className="group flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/20"
        >
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm", color)}>
            <Icon className="h-4 w-4" />
          </span>
          {label}
        </Link>
      ))}
    </div>
  );
}

const TRAVEL_MONTHS = [
  { value: "jan", label: "January" },
  { value: "feb", label: "February" },
  { value: "mar", label: "March" },
  { value: "apr", label: "April" },
  { value: "may", label: "May" },
  { value: "jun", label: "June" },
  { value: "jul", label: "July" },
  { value: "aug", label: "August" },
  { value: "sep", label: "September" },
  { value: "oct", label: "October" },
  { value: "nov", label: "November" },
  { value: "dec", label: "December" },
] as const;

export function HeroSearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("search", destination.trim());
    if (month) params.set("month", month);
    const qs = params.toString();
    router.push(qs ? `/trips?${qs}` : "/trips");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "homepage-fade-up mx-auto w-full max-w-3xl rounded-2xl border border-white/25 bg-white p-2 shadow-2xl shadow-black/25 [animation-delay:180ms]",
        className
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <label className="flex flex-1 cursor-text items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
            <MapPin className="h-4 w-4 text-[#F58220]" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Destination
            </span>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ladakh, Spiti, Kashmir..."
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </span>
        </label>

        <div className="hidden h-auto w-px bg-slate-200 md:block" />

        <label className="relative flex flex-1 cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
            <Calendar className="h-4 w-4 text-[#F58220]" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Travel Month
            </span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full appearance-none bg-transparent text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">Any month</option>
              {TRAVEL_MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </span>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
        </label>

        <Button
          type="submit"
          size="lg"
          className="h-auto rounded-xl bg-[#F58220] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/25 hover:bg-[#e07418]"
        >
          <Search className="h-4 w-4" />
          Search Trips
        </Button>
      </div>
    </form>
  );
}

export function TrustBar() {
  const items = [
    { label: "Google Reviews", rating: "4.8", sub: "2,400+ verified reviews", accent: "text-[#4285F4]" },
    { label: "Trustpilot", rating: "4.9", sub: "Excellent rating", accent: "text-[#00B67A]" },
    { label: "TripAdvisor", rating: "4.7", sub: "Top-rated operator", accent: "text-[#34E0A1]" },
  ];

  return (
    <section className="border-b border-slate-200/80 bg-white">
      <div className="site-container grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
              <Star className={cn("h-6 w-6 fill-amber-400 text-amber-400")} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {item.rating}
                <span className="ml-1 text-sm font-normal text-muted-foreground">/ 5</span>
              </p>
              <p className={cn("text-xs font-semibold", item.accent)}>{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatsStrip() {
  const stats = [
    { value: "15K+", label: "Happy Travelers", icon: Users },
    { value: "50+", label: "Curated Trips", icon: MapPin },
    { value: "8+", label: "Years Experience", icon: Shield },
    { value: "4.8★", label: "Average Rating", icon: Star },
  ];

  return (
    <section className="bg-primary py-10 text-white">
      <div className="site-container grid grid-cols-2 gap-6 lg:grid-cols-4">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Icon className="h-6 w-6 text-orange-300" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-sm text-orange-100">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function DestinationQuickNav({
  destinations,
}: {
  destinations: { name: string; href: string; imageUrl: string | null }[];
}) {
  return (
    <section className="border-b bg-slate-50 py-6">
      <div className="site-container">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Popular Destinations
        </p>
        <div className="scrollbar-hide flex justify-start gap-4 overflow-x-auto pb-1 sm:justify-center">
          {destinations.map((d) => (
            <Link
              key={d.href}
              href={d.href}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white shadow-md transition-transform group-hover:scale-105 group-hover:ring-primary">
                {d.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.imageUrl} alt={d.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-slate-700 group-hover:text-primary">
                {d.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InquiryStrip() {
  return (
    <section className="relative overflow-hidden bg-slate-900 py-14 text-white">
      <div className="homepage-pattern absolute inset-0 opacity-30" />
      <div className="relative site-container flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="max-w-xl text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
            Custom Adventures
          </p>
          <h2 className="mt-2 text-3xl font-bold">Plan Your Dream Himalayan Trip</h2>
          <p className="mt-3 text-slate-300">
            Private groups, corporate offsites, honeymoons — tell us your dates and we&apos;ll craft
            the perfect itinerary.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="bg-orange-500 px-8 hover:bg-orange-600">
            <Link href="/contact">
              <Heart className="h-4 w-4" />
              Get a Free Quote
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/trips">Browse All Trips</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = "View All",
  align = "left",
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "text-center sm:flex-col sm:items-center"
      )}
    >
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Backpackclan
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {viewAllHref ? (
        <Button asChild variant="outline" className="shrink-0 rounded-xl border-slate-200">
          <Link href={viewAllHref}>
            {viewAllLabel}
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export function HeroScrollHint() {
  return (
    <div className="homepage-fade-up absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex [animation-delay:600ms]">
      <span className="text-[10px] font-medium uppercase tracking-[0.25em]">Scroll to explore</span>
      <div className="h-10 w-6 rounded-full border-2 border-white/40 p-1">
        <div className="homepage-scroll-dot mx-auto h-1.5 w-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
}

/** Highlights a middle phrase in the headline for visual punch */
export function highlightHeadline(headline: string): ReactNode {
  const parts = headline.split(/(Himalayas|Ladakh|Backpackclan)/i);
  return parts.map((part, i) =>
    /^(himalayas|ladakh|backpackclan)$/i.test(part) ? (
      <span key={i} className="text-orange-300">
        {part}
      </span>
    ) : (
      part
    )
  );
}
