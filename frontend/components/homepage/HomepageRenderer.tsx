"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mountain, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import type { HomepageSection } from "@/types/homepage";
import type { MediaItem } from "@/types/media";

export function HomepageRenderer() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sectionsRes, mediaRes] = await Promise.all([
          fetch("/api/preview/homepage"),
          fetch("/api/admin/media"),
        ]);
        const sectionsData = await sectionsRes.json();
        const mediaData = await mediaRes.json();

        if (sectionsData.success) setSections(sectionsData.data);

        if (mediaData.success) {
          const map: Record<string, string> = {};
          mediaData.data.forEach((m: MediaItem) => {
            map[m.id] = m.url;
          });
          setMediaMap(map);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSkeleton variant="cards" />;

  return (
    <>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} mediaMap={mediaMap} />
      ))}
    </>
  );
}

function mediaUrl(mediaMap: Record<string, string>, id: string | null) {
  if (!id) return null;
  return mediaMap[id] ?? null;
}

function SectionBlock({
  section,
  mediaMap,
}: {
  section: HomepageSection;
  mediaMap: Record<string, string>;
}) {
  const c = section.content;

  switch (section.type) {
    case "hero": {
      const content = c as import("@/types/homepage").HeroContent;
      const bg = mediaUrl(mediaMap, content.mediaId);
      return (
        <section
          className="relative flex min-h-[70vh] items-center justify-center text-white"
          style={
            bg && content.mediaType === "image"
              ? { backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: "linear-gradient(to bottom right, #134e4a, #0f172a)" }
          }
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">{content.headline}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">{content.subheadline}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {content.ctas.map((cta, i) => (
                <Button
                  key={i}
                  size="lg"
                  variant={cta.style === "outline" ? "outline" : "default"}
                  className={cta.style === "primary" ? "bg-orange-500 hover:bg-orange-600" : ""}
                >
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "featured_destinations": {
      const content = c as import("@/types/homepage").FeaturedDestinationsContent;
      return (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">{content.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {content.cards.map((card) => (
              <Card key={card.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  {mediaUrl(mediaMap, card.imageId) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(mediaMap, card.imageId)!} alt={card.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="font-semibold">{card.name}</p>
                  <p className="text-xs text-muted-foreground">{card.tripCount} trips</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      );
    }

    case "popular_trips": {
      const content = c as import("@/types/homepage").PopularTripsContent;
      return (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-4 text-center text-2xl font-bold">{content.title}</h2>
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {content.filterTags.map((tag) => (
                <span key={tag} className="rounded-full bg-white border px-3 py-1 text-xs font-medium">{tag}</span>
              ))}
            </div>
            <div className={`grid gap-4 ${content.layout === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
              {[1, 2, 3].map((n) => (
                <Card key={n}>
                  <CardContent className="flex h-40 items-center justify-center p-6 text-muted-foreground text-sm">
                    Trip card {n} (Milestone 3)
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "why_choose_us": {
      const content = c as import("@/types/homepage").WhyChooseUsContent;
      return (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold">{content.title}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {content.blocks.map((block) => (
              <div key={block.id} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {block.icon.slice(0, 2)}
                </div>
                <h3 className="font-semibold">{block.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{block.description}</p>
              </div>
            ))}
          </div>
        </section>
      );
    }

    case "testimonials": {
      const content = c as import("@/types/homepage").TestimonialsContent;
      return (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">{content.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="mb-2 flex gap-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm italic text-muted-foreground">&ldquo;{item.text}&rdquo;</p>
                    <p className="mt-4 font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.trip}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "gallery": {
      const content = c as import("@/types/homepage").GalleryContent;
      return (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-center text-2xl font-bold">{content.title}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {content.imageIds.map((id) => {
              const url = mediaUrl(mediaMap, id);
              return url ? (
                <div key={id} className="aspect-square overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform" />
                </div>
              ) : null;
            })}
          </div>
        </section>
      );
    }

    case "blog_highlights": {
      const content = c as import("@/types/homepage").BlogHighlightsContent;
      return (
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">{content.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {mediaUrl(mediaMap, post.imageId) && (
                    <div className="aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(mediaMap, post.imageId)!} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{post.date}</p>
                    <h3 className="mt-1 font-semibold">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      );
    }

    case "newsletter_cta": {
      const content = c as import("@/types/homepage").NewsletterCtaContent;
      return (
        <section className="bg-teal-900 py-16 text-white">
          <div className="mx-auto max-w-xl px-4 text-center">
            <h2 className="text-2xl font-bold">{content.headline}</h2>
            <p className="mt-3 text-teal-100">{content.description}</p>
            <div className="mt-6 flex gap-2">
              <input
                type="email"
                placeholder={content.placeholder}
                className="flex-1 rounded-lg px-4 py-2 text-slate-900 text-sm"
                readOnly
              />
              <Button className="bg-orange-500 hover:bg-orange-600">{content.buttonText}</Button>
            </div>
          </div>
        </section>
      );
    }

    case "partner_logos": {
      const content = c as import("@/types/homepage").PartnerLogosContent;
      return (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-center text-lg font-semibold text-muted-foreground">{content.title}</h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {content.logos.map((logo) => {
              const url = mediaUrl(mediaMap, logo.imageId);
              return url ? (
                <div key={logo.id} className="h-12 w-24 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
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
            <h2 className="mb-8 text-center text-2xl font-bold">{content.title}</h2>
            <div className="space-y-4">
              {content.items.map((item) => (
                <details key={item.id} className="rounded-lg border bg-white p-4 group">
                  <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                    {item.question}
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
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

export function HomepagePreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Mountain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Backpackclan</span>
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
