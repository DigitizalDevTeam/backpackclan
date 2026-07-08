"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Shield,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import {
  CategoryChips,
  DestinationQuickNav,
  HeroScrollHint,
  HeroSearchBar,
  highlightHeadline,
  InquiryStrip,
  SectionHeader,
  StatsStrip,
  TripCard,
  TrustBar,
} from "@/components/homepage/homepage-parts";
import { ScrollCarousel } from "@/components/homepage/ScrollCarousel";
import type { HomepageSection } from "@/types/homepage";
import type { PublicTrip } from "@/types/trip";
import type { Banner } from "@/types/banner";
import { cn } from "@/lib/utils";

export interface HomepageRendererProps {
  sections?: HomepageSection[];
  mediaMap?: Record<string, string>;
  trips?: PublicTrip[];
  secondaryBanner?: Banner | null;
  fetchOnClient?: boolean;
}

export function HomepageRenderer({
  sections: initialSections,
  mediaMap: initialMediaMap,
  trips: initialTrips,
  secondaryBanner: initialBanner,
  fetchOnClient = false,
}: HomepageRendererProps) {
  const [sections, setSections] = useState<HomepageSection[]>(initialSections ?? []);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>(initialMediaMap ?? {});
  const [trips, setTrips] = useState<PublicTrip[]>(initialTrips ?? []);
  const [secondaryBanner, setSecondaryBanner] = useState<Banner | null>(initialBanner ?? null);
  const [loading, setLoading] = useState(fetchOnClient);

  useEffect(() => {
    if (!fetchOnClient) return;

    async function load() {
      try {
        const res = await fetch("/api/preview/homepage");
        const data = await res.json();
        if (data.success) {
          const payload = data.data;
          if (Array.isArray(payload)) {
            setSections(payload);
          } else {
            setSections(payload.sections ?? []);
            if (payload.trips) setTrips(payload.trips);
            if (payload.secondaryBanner !== undefined) {
              setSecondaryBanner(payload.secondaryBanner);
            }
          }
        }

        const mediaRes = await fetch("/api/admin/media");
        const mediaData = await mediaRes.json();

        if (mediaData.success) {
          const map: Record<string, string> = {};
          mediaData.data.forEach((m: { id: string; url: string }) => {
            map[m.id] = m.url;
          });
          setMediaMap(map);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchOnClient]);

  if (loading) return <LoadingSkeleton variant="cards" />;

  let showTrustBar = true;
  let destinationCards: import("@/types/homepage").DestinationCard[] = [];

  sections.forEach((s) => {
    if (s.type === "featured_destinations") {
      destinationCards = (s.content as import("@/types/homepage").FeaturedDestinationsContent).cards;
    }
  });

  return (
    <>
      {sections.map((section, index) => {
        const block = (
          <SectionBlock
            key={section.id}
            section={section}
            mediaMap={mediaMap}
            trips={trips}
            secondaryBanner={secondaryBanner}
            isFirst={index === 0}
          />
        );

        if (section.type === "hero" && showTrustBar) {
          showTrustBar = false;
          return (
            <div key={section.id}>
              {block}
              <TrustBar />
              <StatsStrip />
              {destinationCards.length > 0 ? (
                <DestinationQuickNav
                  destinations={destinationCards.map((c) => ({
                    name: c.name,
                    href: c.link,
                    imageUrl: mediaMap[c.imageId ?? ""] ?? null,
                  }))}
                />
              ) : null}
            </div>
          );
        }

        return block;
      })}
    </>
  );
}

function mediaUrl(mediaMap: Record<string, string>, id: string | null) {
  if (!id) return null;
  return mediaMap[id] ?? null;
}

function getLucideIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[name] ?? Shield;
}

function SectionBlock({
  section,
  mediaMap,
  trips,
  secondaryBanner,
  isFirst,
}: {
  section: HomepageSection;
  mediaMap: Record<string, string>;
  trips: PublicTrip[];
  secondaryBanner: Banner | null;
  isFirst: boolean;
}) {
  const c = section.content;

  switch (section.type) {
    case "hero": {
      const content = c as import("@/types/homepage").HeroContent;
      const bg = mediaUrl(mediaMap, content.mediaId);
      return (
        <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden text-white">
          <div
            className="homepage-hero-bg absolute inset-0 bg-cover bg-center"
            style={
              bg && content.mediaType === "image"
                ? { backgroundImage: `url(${bg})` }
                : { background: "linear-gradient(135deg, #0f766e 0%, #0f172a 100%)" }
            }
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/80" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(13,148,136,0.25),transparent_55%)]" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-24 text-center lg:py-28">
            <div className="homepage-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-orange-200 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              India&apos;s #1 Himalayan Adventure Community
            </div>
            <h1 className="homepage-fade-up text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl [animation-delay:100ms]">
              {highlightHeadline(content.headline)}
            </h1>
            <p className="homepage-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl [animation-delay:150ms]">
              {content.subheadline}
            </p>
            <HeroSearchBar />
            <div className="homepage-fade-up mt-8 [animation-delay:300ms]">
              <CategoryChips />
            </div>
            <div className="homepage-fade-up mt-8 flex flex-wrap justify-center gap-4 [animation-delay:400ms]">
              {content.ctas.map((cta, i) => (
                <Button
                  key={i}
                  size="lg"
                  variant={cta.style === "outline" ? "outline" : "default"}
                  className={cn(
                    "rounded-xl px-8 font-semibold",
                    cta.style === "primary"
                      ? "bg-orange-500 shadow-lg shadow-orange-500/30 hover:bg-orange-600"
                      : "border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                  )}
                  asChild
                >
                  <Link href={cta.url}>
                    {cta.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>

            <div className="homepage-fade-up mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 [animation-delay:500ms]">
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-300" />
                Safe & verified guides
              </span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-300" />
                Small group sizes
              </span>
              <span className="hidden h-4 w-px bg-white/20 sm:block" />
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.8★ average rating
              </span>
            </div>
          </div>
          <HeroScrollHint />
        </section>
      );
    }

    case "featured_destinations": {
      const content = c as import("@/types/homepage").FeaturedDestinationsContent;

      return (
        <>
          {secondaryBanner ? (
            <PromoBanner banner={secondaryBanner} mediaMap={mediaMap} />
          ) : null}
          <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
            <div className="homepage-pattern absolute inset-0 opacity-20" />
            <div className="relative mx-auto max-w-7xl px-4">
              <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.6fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                    Explore India & Beyond
                  </p>
                  <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{content.title}</h2>
                  <p className="mt-4 text-slate-300 leading-relaxed">
                    From the high passes of Ladakh to the monasteries of Bhutan — discover
                    handpicked destinations with curated adventures.
                  </p>
                  <Button asChild className="mt-6 rounded-xl bg-orange-500 px-6 hover:bg-orange-600">
                    <Link href="/destinations">
                      View All Destinations
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <ScrollCarousel
                  itemClassName="w-[70%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(33.333%-11px)]"
                  arrowClassName="border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
                >
                  {content.cards.map((card) => {
                    const url = mediaUrl(mediaMap, card.imageId);
                    return (
                      <Link
                        key={card.id}
                        href={card.link}
                        className="group block overflow-hidden rounded-2xl ring-1 ring-white/10"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={url}
                              alt={card.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <div className="absolute bottom-0 w-full p-5">
                            <p className="text-xl font-bold">{card.name}</p>
                            <p className="text-sm text-slate-300">{card.tripCount} trips available</p>
                            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-300 opacity-0 transition-opacity group-hover:opacity-100">
                              Explore <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </ScrollCarousel>
              </div>
            </div>
          </section>
        </>
      );
    }

    case "popular_trips": {
      const content = c as import("@/types/homepage").PopularTripsContent;
      return (
        <PopularTripsSection content={content} trips={trips} mediaMap={mediaMap} />
      );
    }

    case "why_choose_us": {
      const content = c as import("@/types/homepage").WhyChooseUsContent;
      return (
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
          <div className="homepage-pattern absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-7xl px-4">
            <SectionHeader
              title={content.title}
              subtitle="Trusted by thousands of Himalayan travelers since 2018"
              align="center"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {content.blocks.map((block) => {
                const Icon = getLucideIcon(block.icon);
                return (
                  <Card
                    key={block.id}
                    className="group border-0 bg-white/80 shadow-md ring-1 ring-slate-100 backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-7 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary transition-transform group-hover:scale-110">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold">{block.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {block.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "testimonials": {
      const content = c as import("@/types/homepage").TestimonialsContent;
      return (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title={content.title}
              subtitle="Real stories from real travelers who explored with us"
            />
            <ScrollCarousel itemClassName="w-[90%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]">
              {content.items.map((item) => (
                <Card key={item.id} className="h-full border-0 bg-white shadow-md ring-1 ring-slate-100">
                  <CardContent className="flex h-full flex-col p-7">
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="flex-1 text-base leading-relaxed text-slate-600">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-teal-600 text-sm font-bold text-white">
                        {item.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-primary">{item.trip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollCarousel>
          </div>
        </section>
      );
    }

    case "gallery": {
      const content = c as import("@/types/homepage").GalleryContent;
      return (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader
              title={content.title}
              subtitle="As seen on Instagram — real moments from our community"
              align="center"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {content.imageIds.map((id, index) => {
                const url = mediaUrl(mediaMap, id);
                return url ? (
                  <div
                    key={id}
                    className={cn(
                      "group relative aspect-square overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200/60",
                      index === 0 && "sm:col-span-2 sm:row-span-2 sm:aspect-auto"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">@backpackclan</span>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </section>
      );
    }

    case "blog_highlights": {
      const content = c as import("@/types/homepage").BlogHighlightsContent;
      const [featured, ...rest] = content.posts;

      return (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <SectionHeader title={content.title} viewAllHref="/blog" />
            <div className="grid gap-6 lg:grid-cols-2">
              {featured ? (
                <Link
                  href={featured.link}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-100 transition-all hover:shadow-xl"
                >
                  {mediaUrl(mediaMap, featured.imageId) ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(mediaMap, featured.imageId)!}
                        alt={featured.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="p-6">
                    <Badge className="mb-3 border-0 bg-primary/10 text-primary">Featured</Badge>
                    <p className="text-xs font-medium text-muted-foreground">
                      {new Date(featured.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mt-2 text-xl font-bold leading-snug group-hover:text-primary">
                      {featured.title}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-muted-foreground">{featured.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ) : null}
              <div className="flex flex-col gap-4">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={post.link}
                    className="group flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md"
                  >
                    {mediaUrl(mediaMap, post.imageId) ? (
                      <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaUrl(mediaMap, post.imageId)!}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <h3 className="mt-1 line-clamp-2 font-semibold group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "newsletter_cta": {
      const content = c as import("@/types/homepage").NewsletterCtaContent;
      return (
        <>
          <InquiryStrip />
          <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 py-20 text-white">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-600/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-300">
                Stay in the loop
              </p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{content.headline}</h2>
              <p className="mt-4 text-teal-100 leading-relaxed">{content.description}</p>
              <ul className="mt-8 space-y-3">
                {[
                  "Early-bird discounts on new departures",
                  "Exclusive Himalayan travel tips & guides",
                  "First access to limited-seat trips",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-teal-100">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-8 text-slate-900 shadow-2xl">
              <p className="text-lg font-bold">Subscribe to our newsletter</p>
              <p className="mt-1 text-sm text-muted-foreground">Join 5,000+ adventure seekers</p>
              <div className="mt-6 space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
                <input
                  type="email"
                  placeholder={content.placeholder}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  readOnly
                />
                <Button className="w-full rounded-xl bg-orange-500 py-3 text-base font-semibold hover:bg-orange-600">
                  {content.buttonText}
                </Button>
              </div>
              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
        </>
      );
    }

    case "partner_logos": {
      const content = c as import("@/types/homepage").PartnerLogosContent;
      return (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-8 text-center text-lg font-semibold text-muted-foreground">
            {content.title}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {content.logos.map((logo) => {
              const url = mediaUrl(mediaMap, logo.imageId);
              return url ? (
                <div
                  key={logo.id}
                  className="h-12 w-28 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={logo.name} className="h-full w-full object-contain" />
                </div>
              ) : null;
            })}
          </div>
        </section>
      );
    }

    case "faq_strip": {
      const content = c as import("@/types/homepage").FaqStripContent;
      return (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <SectionHeader title={content.title} subtitle="Everything you need to know before you go" />
            <div className="space-y-3">
              {content.items.map((item) => (
                <details
                  key={item.id}
                  className="group rounded-xl border bg-white p-5 shadow-sm open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                    {item.question}
                    <span className="text-muted-foreground transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}

function PopularTripsSection({
  content,
  trips,
  mediaMap,
}: {
  content: import("@/types/homepage").PopularTripsContent;
  trips: PublicTrip[];
  mediaMap: Record<string, string>;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = trips.filter((trip) => {
    if (!activeTag || activeTag === "All") return true;
    if (activeTag === "Guaranteed Departures") return trip.badge === "Guaranteed";
    return trip.category === activeTag;
  });
  const displayTrips = filtered.length > 0 ? filtered : trips;

  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          title={content.title}
          subtitle="Curated adventures with guaranteed departures and expert local guides"
          viewAllHref="/trips"
        />
        <div className="mb-8 flex flex-wrap gap-2">
          {["All", ...content.filterTags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === "All" ? null : tag)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                (tag === "All" && !activeTag) || activeTag === tag
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-primary hover:text-primary"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        <ScrollCarousel itemClassName="w-[88%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]">
          {displayTrips.slice(0, 8).map((trip) => (
            <TripCard key={trip.id} trip={trip} imageUrl={mediaUrl(mediaMap, trip.imageId)} />
          ))}
        </ScrollCarousel>
        <div className="mt-10 text-center">
          <Button asChild size="lg" className="rounded-xl bg-orange-500 px-10 hover:bg-orange-600">
            <Link href="/trips">
              View All Trips
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PromoBanner({
  banner,
  mediaMap,
}: {
  banner: Banner;
  mediaMap: Record<string, string>;
}) {
  const bg = mediaUrl(mediaMap, banner.mediaId);
  const cta = banner.ctaButtons[0];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
        {bg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/50" />
        <div className="relative flex flex-col items-start justify-between gap-8 p-8 sm:flex-row sm:items-center sm:p-12 lg:p-14">
          <div>
            <Badge className="mb-4 border-0 bg-orange-500/20 text-orange-200">Limited Offer</Badge>
            <h3 className="text-2xl font-bold text-white sm:text-4xl">{banner.headline}</h3>
            <p className="mt-3 max-w-xl text-base text-slate-300">{banner.subheadline}</p>
          </div>
          {cta ? (
            <Button
              asChild
              size="lg"
              className="shrink-0 rounded-xl bg-orange-500 px-8 shadow-lg shadow-orange-500/30 hover:bg-orange-600"
            >
              <Link href={cta.url}>
                {cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HomepagePreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/preview/homepage" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">Backpackclan</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/preview/trips" className="hover:text-foreground">
                Trips
              </Link>
              <Link href="/preview/destinations" className="hover:text-foreground">
                Destinations
              </Link>
              <Link href="/preview/homepage" className="hover:text-foreground">
                Homepage
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              Preview
            </span>
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/homepage">Edit Homepage</Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
