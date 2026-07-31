"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  MapPin,
  Mountain,
  Share2,
  Star,
  Users,
  X,
} from "lucide-react";
import type { PublicTrip, TripDetailContent, TripBatch } from "@/types/trip";
import type { RiderOptionKey, RoomOptionKey } from "@/types/travel";
import {
  enabledRiderOptions,
  enabledRoomOptions,
  normalizeDynamicPricing,
  resolveDynamicUnitPrice,
  RIDER_OPTION_LABELS,
  ROOM_OPTION_LABELS,
} from "@/lib/pricing/dynamic-options";
import { formatInr } from "@/lib/site/format";
import { TripCard } from "@/components/homepage/homepage-parts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "inclusions", label: "Inclusions" },
  { id: "batches", label: "Batches" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "policies", label: "Policies" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const batchStatusLabel: Record<TripBatch["status"], { text: string; className: string }> = {
  available: { text: "Available", className: "bg-emerald-100 text-emerald-700" },
  filling_fast: { text: "Filling Fast", className: "bg-orange-100 text-orange-700" },
  sold_out: { text: "Sold Out", className: "bg-slate-100 text-slate-500" },
};

interface TripDetailViewProps {
  trip: PublicTrip;
  detail: TripDetailContent;
  mediaMap: Record<string, string>;
  similarTrips: PublicTrip[];
}

export function TripDetailView({
  trip,
  detail,
  mediaMap,
  similarTrips,
}: TripDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedBatch, setSelectedBatch] = useState(
    detail.batches.find((b) => b.status !== "sold_out")?.id ??
      detail.batches[0]?.id ??
      ""
  );
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const pricingOptions = detail.pricingOptions ?? null;
  const dynamicConfig = useMemo(
    () =>
      pricingOptions
        ? normalizeDynamicPricing({
            enabled: pricingOptions.enabled,
            riderEnabled: pricingOptions.riderEnabled,
            roomEnabled: pricingOptions.roomEnabled,
            riders: pricingOptions.riderPrices,
            rooms: pricingOptions.roomPrices,
            matrix: pricingOptions.matrix,
          })
        : null,
    [pricingOptions]
  );

  const riderChoices = useMemo(
    () => (dynamicConfig ? enabledRiderOptions(dynamicConfig) : []),
    [dynamicConfig]
  );
  const [riderOption, setRiderOption] = useState<RiderOptionKey | "">(
    () => (dynamicConfig ? enabledRiderOptions(dynamicConfig)[0] : "") ?? ""
  );
  const roomChoices = useMemo(
    () =>
      dynamicConfig
        ? enabledRoomOptions(dynamicConfig, riderOption || null)
        : [],
    [dynamicConfig, riderOption]
  );
  const [roomOption, setRoomOption] = useState<RoomOptionKey | "">("");

  useEffect(() => {
    if (riderChoices.length && !riderChoices.includes(riderOption as RiderOptionKey)) {
      setRiderOption(riderChoices[0] ?? "");
    }
  }, [riderChoices, riderOption]);

  useEffect(() => {
    if (roomChoices.length && !roomChoices.includes(roomOption as RoomOptionKey)) {
      setRoomOption(roomChoices[0] ?? "");
    }
    if (!roomChoices.length) setRoomOption("");
  }, [roomChoices, roomOption]);

  const galleryUrls = detail.galleryImageIds
    .map((id) => mediaMap[id])
    .filter(Boolean) as string[];
  const mainImage = galleryUrls[0] ?? mediaMap[trip.imageId] ?? null;
  const galleryPool = (
    galleryUrls.length > 0
      ? galleryUrls
      : [mainImage, mediaMap[trip.imageId]].filter(Boolean)
  ) as string[];
  /** Exactly 4 equal tiles — pad by cycling when fewer unique images exist */
  const galleryTiles =
    galleryPool.length > 0
      ? Array.from({ length: 4 }, (_, i) => galleryPool[i % galleryPool.length])
      : [];
  const selectedBatchData = detail.batches.find((b) => b.id === selectedBatch);
  const optionUnitPrice =
    dynamicConfig?.enabled
      ? resolveDynamicUnitPrice(dynamicConfig, {
          rider: riderOption || null,
          room: roomOption || null,
        })
      : null;
  const unitPrice = optionUnitPrice ?? selectedBatchData?.price ?? trip.price;
  const qs = new URLSearchParams({
    ...(selectedBatch ? { departure: selectedBatch } : {}),
    adults: String(adults),
    children: String(children),
    ...(riderOption ? { rider: riderOption } : {}),
    ...(roomOption ? { room: roomOption } : {}),
  });
  const bookHref = `/book/${trip.slug}?${qs.toString()}`;
  const canBook =
    Boolean(selectedBatchData) && selectedBatchData?.status !== "sold_out";
  const pax = adults + children;
  const estimatedTotal = unitPrice * pax;
  const showDynamic = Boolean(dynamicConfig?.enabled && (riderChoices.length || roomChoices.length));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setActiveTab(visible.target.id.replace("section-", "") as TabId);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] }
    );

    TABS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollToSection(id: TabId) {
    setActiveTab(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* Gallery — exactly 4 equal tiles with hover zoom */}
      <section className="relative bg-slate-100">
        <div className="site-container grid grid-cols-2 gap-2 p-2 sm:grid-cols-4 sm:gap-3 sm:p-4">
          {galleryTiles.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-slate-200/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={i === 0 ? trip.title : `Gallery image ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <span className="pointer-events-none absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/15" />
            </button>
          ))}
        </div>
        {galleryUrls.length > 0 ? (
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="absolute bottom-6 right-6 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 sm:bottom-10 sm:right-10"
          >
            View Gallery
          </button>
        ) : null}
      </section>

      {/* Title + quick info */}
      <section className="border-b bg-white">
        <div className="site-container py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              {trip.badge ? (
                <Badge className="mb-2 border-0 bg-orange-500 text-white">{trip.badge}</Badge>
              ) : null}
              <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl">
                {trip.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 font-medium">
                  <StarRating rating={trip.rating} />
                  <span className="ml-1">{trip.rating}</span>
                  <span className="text-muted-foreground">({trip.reviewCount} reviews)</span>
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {trip.destination}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Quick facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {detail.quickFacts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-xl border bg-slate-50 px-4 py-3 text-center sm:text-left"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {fact.label}
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky tabs */}
        <div
          ref={tabsRef}
          className="sticky top-[7.25rem] z-40 border-t bg-white/95 backdrop-blur-md lg:top-[4rem]"
        >
          <div className="site-container flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  "shrink-0 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main layout */}
      <div className="site-container py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Content */}
          <div className="min-w-0 space-y-12">
            {/* Overview */}
            <section id="section-overview" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">Overview</h2>
              <p className="leading-relaxed text-muted-foreground">{detail.overview}</p>
              <p className="mt-4 leading-relaxed text-muted-foreground">{detail.overviewExtended}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-semibold">{trip.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Mountain className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Difficulty</p>
                    <p className="font-semibold">{detail.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Group Size</p>
                    <p className="font-semibold">12–18 travelers</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Itinerary */}
            <section id="section-itinerary" className="scroll-mt-44">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Day-wise Itinerary</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
              <div className="space-y-2">
                {detail.itinerary.map((day) => (
                  <details
                    key={day.day}
                    className="group rounded-xl border bg-white open:shadow-sm"
                    open={day.day <= 2}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {day.day}
                        </span>
                        <span>
                          <span className="block text-xs font-normal text-primary">
                            Day {day.day}
                          </span>
                          {day.title}
                        </span>
                      </span>
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t px-5 pb-5 pt-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {day.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {day.meals ? <span>🍽 {day.meals}</span> : null}
                        {day.overnight ? <span>🏨 Overnight: {day.overnight}</span> : null}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Inclusions */}
            <section id="section-inclusions" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">Inclusions & Exclusions</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border bg-emerald-50/50 p-5">
                  <h3 className="mb-3 font-semibold text-emerald-800">What&apos;s Included</h3>
                  <ul className="space-y-2">
                    {detail.inclusions.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border bg-red-50/50 p-5">
                  <h3 className="mb-3 font-semibold text-red-800">What&apos;s Not Included</h3>
                  <ul className="space-y-2">
                    {detail.exclusions.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-700">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {detail.thingsToCarry.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <h3 className="mb-3 font-semibold text-primary">Things to Carry</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {detail.thingsToCarry.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>

            {/* Batches */}
            <section id="section-batches" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">Upcoming Batches</h2>
              <div className="overflow-hidden rounded-2xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Seats</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {detail.batches.map((batch) => {
                      const status = batchStatusLabel[batch.status];
                      return (
                        <tr key={batch.id} className="bg-white hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium">{batch.date}</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                status.className
                              )}
                            >
                              {status.text}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {batch.status === "sold_out" ? "—" : `${batch.seatsLeft} left`}
                          </td>
                          <td className="px-4 py-3 font-bold">{formatInr(batch.price)}</td>
                          <td className="px-4 py-3 text-right">
                            {batch.status !== "sold_out" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedBatch(batch.id)}
                              >
                                Select
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Reviews */}
            <section id="section-reviews" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">What Our Travelers Say</h2>
              {detail.reviews.length === 0 ? (
                <p className="rounded-2xl border border-dashed bg-slate-50 px-5 py-8 text-sm text-muted-foreground">
                  No reviews yet. Be the first to share your experience after your trip.
                </p>
              ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {detail.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                      </div>
                      {review.source === "customer" ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-700">
                          Verified traveler
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3 border-t pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{review.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </section>

            {/* FAQ */}
            <section id="section-faq" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {detail.faqs.map((faq) => (
                  <details key={faq.id} className="group rounded-xl border bg-white">
                    <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-medium">
                      {faq.question}
                      <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="border-t px-5 pb-5 pt-4 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* Policies */}
            <section id="section-policies" className="scroll-mt-44">
              <h2 className="mb-4 text-xl font-bold">Policies</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-semibold">Cancellation Policy</h3>
                  <ul className="space-y-2">
                    {detail.cancellationPolicy.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold">Refund Policy</h3>
                  <ul className="space-y-2">
                    {detail.refundPolicy.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky booking sidebar */}
          <aside className="lg:sticky lg:top-36 lg:self-start">
            <div className="rounded-2xl border bg-white p-6 shadow-xl ring-1 ring-slate-100">
              <p className="text-sm text-muted-foreground">
                {showDynamic ? "Your price" : "Starting from"}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{formatInr(unitPrice)}</span>
                <span className="text-sm text-muted-foreground">/ person</span>
              </div>
              {!showDynamic && trip.originalPrice ? (
                <p className="mt-1 text-sm text-red-500 line-through">
                  {formatInr(trip.originalPrice)}
                </p>
              ) : null}

              <div className="mt-5 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Select Batch
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {detail.batches
                      .filter((b) => b.status !== "sold_out")
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.date}
                          {!showDynamic ? ` — ${formatInr(b.price)}` : ""}
                        </option>
                      ))}
                  </select>
                </div>

                {showDynamic && riderChoices.length > 0 ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Rider option
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {riderChoices.map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setRiderOption(key)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                            riderOption === key
                              ? "border-[#F58220] bg-[#FFF7ED] text-[#F58220]"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          )}
                        >
                          {RIDER_OPTION_LABELS[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {showDynamic && roomChoices.length > 0 ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Room sharing
                    </label>
                    <div className="grid gap-2">
                      {roomChoices.map((key) => {
                        const price = resolveDynamicUnitPrice(dynamicConfig!, {
                          rider: riderOption || null,
                          room: key,
                        });
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setRoomOption(key)}
                            className={cn(
                              "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                              roomOption === key
                                ? "border-[#F58220] bg-[#FFF7ED] text-[#F58220]"
                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                            )}
                          >
                            <span>{ROOM_OPTION_LABELS[key]}</span>
                            {price ? (
                              <span className="text-xs font-medium opacity-80">
                                {formatInr(price)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Adults
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Children
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Est. total{" "}
                  <span className="font-semibold text-foreground">
                    {formatInr(estimatedTotal)}
                  </span>{" "}
                  for {pax} traveler{pax > 1 ? "s" : ""}
                </p>
              </div>

              {canBook ? (
                <Button
                  asChild
                  className="mt-5 w-full rounded-xl bg-primary py-3 text-base font-semibold hover:bg-primary/90"
                >
                  <Link href={bookHref}>Book Now</Link>
                </Button>
              ) : (
                <Button
                  disabled
                  className="mt-5 w-full rounded-xl bg-primary py-3 text-base font-semibold"
                >
                  Sold out
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="mt-2 w-full rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Link href="/inquire/custom-trip">Enquire Now</Link>
              </Button>

              <div className="mt-5 space-y-2 border-t pt-4 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {selectedBatchData?.date ?? trip.departureDates[0]}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {detail.startPoint} → {detail.endPoint}
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar trips — nearby price range */}
        {similarTrips.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Similar price range
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-slate-900">
                  Similar Tours You May Like
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Adventures near {formatInr(trip.price)} — same vibe, close budget.
                </p>
              </div>
              <Link
                href="/trips"
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similarTrips.slice(0, 4).map((t) => (
                <TripCard key={t.id} trip={t} imageUrl={mediaMap[t.imageId] ?? null} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Gallery modal */}
      {galleryOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setGalleryOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="grid max-h-[85vh] max-w-4xl gap-3 overflow-y-auto sm:grid-cols-2">
            {galleryUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="rounded-xl object-cover" />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
