"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { CharacterCounter } from "@/components/admin/seo/CharacterCounter";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import {
  FaqRepeater,
  MapEmbedField,
  MediaGalleryPicker,
  RepeaterField,
  SlugField,
  WeatherMonthGrid,
} from "@/components/forms/travel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DESTINATION_TABS,
  defaultDestinationFormValues,
  destinationFormSchema,
  type DestinationFormValues,
  type DestinationTabId,
} from "@/lib/validations/destination";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { MONTH_NAMES } from "@/types/travel";
import type { PublicTrip } from "@/types/trip";
import type { AuthUser } from "@/types/auth";

interface DestinationFormProps {
  destinationId?: string;
  user: AuthUser;
}

function normalizeDestination(data: Record<string, unknown>): DestinationFormValues {
  const banner = (data.banner ?? {}) as Record<string, unknown>;
  const overview = (data.overview ?? {}) as Record<string, unknown>;
  const bestTime = (data.bestTime ?? {}) as Record<string, unknown>;
  const map = (data.map ?? {}) as Record<string, unknown>;
  const seo = (data.seo ?? {}) as Record<string, unknown>;

  return {
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    country: String(data.country ?? ""),
    region: String(data.region ?? ""),
    tagline: String(data.tagline ?? ""),
    heroImageId: (data.heroImageId as string | null) ?? null,
    isFeatured: Boolean(data.isFeatured),
    sortOrder: Number(data.sortOrder ?? 0),
    status: (data.status as DestinationFormValues["status"]) ?? "draft",
    overview: {
      content: String(overview.content ?? ""),
      highlights: (overview.highlights as DestinationFormValues["overview"]["highlights"]) ?? [],
      gallery: (overview.gallery as string[]) ?? [],
    },
    banner: {
      headline: String(banner.headline ?? ""),
      subheadline: String(banner.subheadline ?? ""),
      ctaLabel: String(banner.ctaLabel ?? banner.cta_label ?? ""),
      ctaUrl: String(banner.ctaUrl ?? banner.cta_url ?? ""),
      mediaId: (banner.mediaId as string | null) ?? (banner.media_id as string | null) ?? null,
    },
    linkedTripIds: (data.linkedTripIds as string[]) ?? [],
    faqs: (data.faqs as DestinationFormValues["faqs"]) ?? [],
    bestTime: {
      content: String(bestTime.content ?? ""),
      recommendedMonths:
        (bestTime.recommendedMonths as number[]) ??
        (bestTime.recommended_months as number[]) ??
        [],
    },
    weather: (data.weather as DestinationFormValues["weather"])?.length
      ? (data.weather as DestinationFormValues["weather"])
      : defaultDestinationFormValues().weather,
    map: {
      embedUrl: String(map.embedUrl ?? map.embed_url ?? ""),
      latitude: (map.latitude as number | null) ?? null,
      longitude: (map.longitude as number | null) ?? null,
    },
    seo: {
      metaTitle: String(seo.metaTitle ?? seo.meta_title ?? ""),
      metaDescription: String(seo.metaDescription ?? seo.meta_description ?? ""),
      ogImageId: (seo.ogImageId as string | null) ?? (seo.og_image_id as string | null) ?? null,
      canonicalUrl: String(seo.canonicalUrl ?? seo.canonical_url ?? ""),
      robots: String(seo.robots ?? "index, follow"),
    },
  };
}

export function DestinationForm({ destinationId, user }: DestinationFormProps) {
  const router = useRouter();
  const isEdit = !!destinationId;
  const canWrite = hasPermission(
    user,
    isEdit ? "destinations.update" : "destinations.create"
  );
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<DestinationTabId>("basics");
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [previewSlug, setPreviewSlug] = useState("");

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema) as Resolver<DestinationFormValues>,
    defaultValues: defaultDestinationFormValues(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  const name = watch("name");
  const watchedSeoTitle = watch("seo.metaTitle");
  const watchedSeoDesc = watch("seo.metaDescription");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function loadTrips() {
      try {
        const res = await fetch("/api/public/trips");
        const result = await res.json();
        if (result.success) setTrips(result.data);
      } catch {
        // non-blocking
      }
    }
    loadTrips();
  }, []);

  useEffect(() => {
    if (!destinationId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/destinations/${destinationId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Destination not found");
          router.push("/admin/destinations");
          return;
        }
        const normalized = normalizeDestination(result.data);
        reset(normalized);
        setPreviewSlug(normalized.slug);
      } catch {
        toast.error("Failed to load destination");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [destinationId, reset, router]);

  async function onSubmit(data: DestinationFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/destinations/${destinationId}`
        : "/api/admin/destinations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to save destination");
        return;
      }

      toast.success(isEdit ? "Destination updated" : "Destination created");
      router.push("/admin/destinations");
    } catch {
      toast.error("Failed to save destination");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleTrip(tripId: string) {
    const current = watch("linkedTripIds");
    if (current.includes(tripId)) {
      setValue(
        "linkedTripIds",
        current.filter((id) => id !== tripId),
        { shouldDirty: true }
      );
    } else {
      setValue("linkedTripIds", [...current, tripId], { shouldDirty: true });
    }
  }

  function toggleMonth(month: number) {
    const current = watch("bestTime.recommendedMonths");
    const next = current.includes(month)
      ? current.filter((m) => m !== month)
      : [...current, month].sort((a, b) => a - b);
    setValue("bestTime.recommendedMonths", next, { shouldDirty: true });
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Destination" : "New Destination"}
        description="Build a destination hub page with overview, weather, FAQs, and linked packages."
        action={
          <div className="flex gap-2">
            {isEdit && previewSlug && (
              <Button variant="outline" asChild>
                <Link href={`/preview/destinations/${previewSlug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/destinations">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1 border-b pb-1">
        {DESTINATION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {activeTab === "basics" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} disabled={readOnly} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <Controller
                control={control}
                name="slug"
                render={({ field }) => (
                  <SlugField
                    value={field.value}
                    onChange={field.onChange}
                    sourceValue={name}
                    disabled={readOnly}
                    error={errors.slug?.message}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register("country")} disabled={readOnly} />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" {...register("region")} disabled={readOnly} />
                  {errors.region && (
                    <p className="text-sm text-destructive">{errors.region.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Short tagline</Label>
                <Input id="tagline" {...register("tagline")} disabled={readOnly} />
              </div>
              <Controller
                control={control}
                name="heroImageId"
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(m) => field.onChange(m?.id ?? null)}
                    accept="image"
                    label="Hero image"
                    disabled={readOnly}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Publish status</Label>
                  <Select id="status" {...register("status")} disabled={readOnly}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min={0}
                    {...register("sortOrder")}
                    disabled={readOnly}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register("isFeatured")}
                      disabled={readOnly}
                      className="rounded border-input"
                    />
                    Featured destination
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "banner" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Optional hero banner for the destination page (separate from the hero image).
              </p>
              <div className="space-y-2">
                <Label htmlFor="banner.headline">Headline</Label>
                <Input id="banner.headline" {...register("banner.headline")} disabled={readOnly} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner.subheadline">Subheadline</Label>
                <Input
                  id="banner.subheadline"
                  {...register("banner.subheadline")}
                  disabled={readOnly}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="banner.ctaLabel">CTA label</Label>
                  <Input
                    id="banner.ctaLabel"
                    {...register("banner.ctaLabel")}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner.ctaUrl">CTA URL</Label>
                  <Input
                    id="banner.ctaUrl"
                    {...register("banner.ctaUrl")}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <Controller
                control={control}
                name="banner.mediaId"
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(m) => field.onChange(m?.id ?? null)}
                    accept="image"
                    label="Banner image"
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "overview" && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label>Overview</Label>
                <Controller
                  control={control}
                  name="overview.content"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="overview.highlights"
                render={({ field }) => (
                  <RepeaterField
                    label="Highlights"
                    items={field.value.map((h) => ({
                      id: h.id,
                      text: h.text,
                      icon: h.icon,
                    }))}
                    onChange={(items) =>
                      field.onChange(
                        items.map((item) => ({
                          id: item.id,
                          text: item.text,
                          icon: item.icon,
                        }))
                      )
                    }
                    placeholder="Highlight text"
                    showIcon
                    disabled={readOnly}
                  />
                )}
              />
              <Controller
                control={control}
                name="overview.gallery"
                render={({ field }) => (
                  <MediaGalleryPicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "packages" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Link published trips to this destination. Full trip management arrives in Phase 3.
              </p>
              {trips.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trips available yet.</p>
              ) : (
                <div className="space-y-2">
                  {trips.map((trip) => (
                    <label
                      key={trip.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30"
                    >
                      <input
                        type="checkbox"
                        checked={watch("linkedTripIds").includes(trip.id)}
                        onChange={() => toggleTrip(trip.id)}
                        disabled={readOnly}
                        className="rounded border-input"
                      />
                      <div>
                        <p className="font-medium text-sm">{trip.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {trip.destination} · {trip.duration}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "faqs" && (
          <Card>
            <CardContent className="pt-6">
              <Controller
                control={control}
                name="faqs"
                render={({ field }) => (
                  <FaqRepeater
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "bestTime" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Best time to visit</Label>
                <Controller
                  control={control}
                  name="bestTime.content"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Recommended months</Label>
                <div className="flex flex-wrap gap-2">
                  {MONTH_NAMES.map((label, index) => {
                    const month = index + 1;
                    const selected = watch("bestTime.recommendedMonths").includes(month);
                    return (
                      <button
                        key={label}
                        type="button"
                        disabled={readOnly}
                        onClick={() => toggleMonth(month)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {label.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "weather" && (
          <Card>
            <CardContent className="pt-6">
              <Controller
                control={control}
                name="weather"
                render={({ field }) => (
                  <WeatherMonthGrid
                    months={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "map" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Controller
                control={control}
                name="map.embedUrl"
                render={({ field }) => (
                  <MapEmbedField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="map.latitude">Latitude (optional)</Label>
                  <Input
                    id="map.latitude"
                    type="number"
                    step="any"
                    {...register("map.latitude", { valueAsNumber: true })}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="map.longitude">Longitude (optional)</Label>
                  <Input
                    id="map.longitude"
                    type="number"
                    step="any"
                    {...register("map.longitude", { valueAsNumber: true })}
                    disabled={readOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "seo" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo.metaTitle">Meta title</Label>
                <Input id="seo.metaTitle" {...register("seo.metaTitle")} disabled={readOnly} />
                <CharacterCounter current={watchedSeoTitle?.length ?? 0} recommended={70} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo.metaDescription">Meta description</Label>
                <Input
                  id="seo.metaDescription"
                  {...register("seo.metaDescription")}
                  disabled={readOnly}
                />
                <CharacterCounter current={watchedSeoDesc?.length ?? 0} recommended={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo.canonicalUrl">Canonical URL</Label>
                <Input
                  id="seo.canonicalUrl"
                  {...register("seo.canonicalUrl")}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo.robots">Robots</Label>
                <Select id="seo.robots" {...register("seo.robots")} disabled={readOnly}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </Select>
              </div>
              <Controller
                control={control}
                name="seo.ogImageId"
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(m) => field.onChange(m?.id ?? null)}
                    accept="image"
                    label="OG image"
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {!readOnly && (
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Destination"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/destinations">Cancel</Link>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
