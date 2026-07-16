"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  DayItineraryEditor,
  FaqRepeater,
  MapEmbedField,
  MediaGalleryPicker,
  PriceInput,
  RepeaterField,
  SlugField,
  TestimonialPicker,
} from "@/components/forms/travel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TRIP_TABS,
  TRIP_TAB_FIELD_RULES,
  TRIP_TAB_LABELS,
  adminTripFormSchema,
  defaultAdminTripFormValues,
  publishTripSchema,
  type AdminTripFormValues,
  type TripTabId,
} from "@/lib/validations/admin-trip";
import {
  createOnInvalidHandler,
  getTabsWithErrors,
  resolveTabForField,
  showValidationToast,
} from "@/lib/forms/multi-tab-validation";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  INCLUSION_TEMPLATES,
  TRIP_DIFFICULTY_LABELS,
  TRIP_TYPE_LABELS,
} from "@/types/admin-trip";
import type { Category } from "@/types/category";
import type { Destination } from "@/types/destination";
import type { AuthUser } from "@/types/auth";

interface TripFormProps {
  tripId?: string;
  user: AuthUser;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function normalizeTrip(data: Record<string, unknown>): AdminTripFormValues {
  const overview = (data.overview ?? {}) as Record<string, unknown>;
  const pricing = (data.pricing ?? {}) as Record<string, unknown>;
  const seo = (data.seo ?? {}) as Record<string, unknown>;

  return {
    destinationId: String(data.destinationId ?? data.destination_id ?? ""),
    categoryIds: asStringArray(data.categoryIds ?? data.category_ids),
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    tripType: (data.tripType as AdminTripFormValues["tripType"]) ?? "bike",
    durationDays: Number(data.durationDays ?? 1),
    durationNights: Number(data.durationNights ?? 0),
    difficulty: (data.difficulty as AdminTripFormValues["difficulty"]) ?? "moderate",
    maxGroupSize: Number(data.maxGroupSize ?? 15),
    minAge: data.minAge != null ? Number(data.minAge) : null,
    maxAltitude: (data.maxAltitude as string | null) ?? null,
    summary: String(data.summary ?? ""),
    coverImageId:
      data.coverImageId != null
        ? String(data.coverImageId)
        : data.cover_image_id != null
          ? String(data.cover_image_id)
          : null,
    gallery: asStringArray(data.gallery),
    overview: {
      content: String(overview.content ?? ""),
      highlights: (overview.highlights as AdminTripFormValues["overview"]["highlights"]) ?? [],
      routeMapEmbed: String(overview.routeMapEmbed ?? overview.route_map_embed ?? ""),
      routeMapImageId:
        (overview.routeMapImageId as string | null) ??
        (overview.route_map_image_id as string | null) ??
        null,
    },
    itinerary: (data.itinerary as AdminTripFormValues["itinerary"]) ?? [],
    inclusions: (data.inclusions as AdminTripFormValues["inclusions"]) ?? [],
    exclusions: (data.exclusions as AdminTripFormValues["exclusions"]) ?? [],
    thingsToCarry: (data.thingsToCarry as AdminTripFormValues["thingsToCarry"]) ?? [],
    cancellationPolicy:
      (data.cancellationPolicy as AdminTripFormValues["cancellationPolicy"]) ?? [],
    refundPolicy: (data.refundPolicy as AdminTripFormValues["refundPolicy"]) ?? [],
    faqs: (data.faqs as AdminTripFormValues["faqs"]) ?? [],
    testimonials: (data.testimonials as AdminTripFormValues["testimonials"]) ?? [],
    pricing: {
      basePrice: Number(pricing.basePrice ?? pricing.base_price ?? 0),
      salePrice:
        pricing.salePrice != null
          ? Number(pricing.salePrice)
          : pricing.sale_price != null
            ? Number(pricing.sale_price)
            : null,
      showStrikeThrough: Boolean(
        pricing.showStrikeThrough ?? pricing.show_strike_through ?? false
      ),
      offerLabel: String(pricing.offerLabel ?? pricing.offer_label ?? ""),
      offerValidUntil:
        (pricing.offerValidUntil as string | null) ??
        (pricing.offer_valid_until as string | null) ??
        null,
      currency: "INR",
      pricePer:
        (pricing.pricePer as AdminTripFormValues["pricing"]["pricePer"]) ??
        (pricing.price_per as AdminTripFormValues["pricing"]["pricePer"]) ??
        "person",
    },
    seo: {
      metaTitle: String(seo.metaTitle ?? seo.meta_title ?? ""),
      metaDescription: String(seo.metaDescription ?? seo.meta_description ?? ""),
      ogImageId: (seo.ogImageId as string | null) ?? (seo.og_image_id as string | null) ?? null,
      canonicalUrl: String(seo.canonicalUrl ?? seo.canonical_url ?? ""),
      robots: String(seo.robots ?? "index, follow"),
    },
    isFeatured: Boolean(data.isFeatured),
    status: (data.status as AdminTripFormValues["status"]) ?? "draft",
    sortOrder: Number(data.sortOrder ?? 0),
  };
}

export function TripForm({ tripId, user }: TripFormProps) {
  const router = useRouter();
  const isEdit = !!tripId;
  const canWrite = hasPermission(user, isEdit ? "trips.update" : "trips.create");
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TripTabId>("basics");
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewSlug, setPreviewSlug] = useState("");

  const form = useForm<AdminTripFormValues>({
    resolver: zodResolver(adminTripFormSchema) as Resolver<AdminTripFormValues>,
    defaultValues: defaultAdminTripFormValues(),
    shouldFocusError: false,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitted },
  } = form;

  const onInvalid = useCallback(
    createOnInvalidHandler({
      rules: TRIP_TAB_FIELD_RULES,
      fallbackTab: "basics",
      setActiveTab,
      tabLabels: TRIP_TAB_LABELS,
    }),
    []
  );

  const tabsWithErrors = useMemo(
    () => getTabsWithErrors(errors, TRIP_TAB_FIELD_RULES, "basics"),
    [errors]
  );

  const title = watch("title");
  const watchedSeoTitle = watch("seo.metaTitle");
  const watchedSeoDesc = watch("seo.metaDescription");
  const watchedPricing = watch("pricing");
  const watchedInclusions = watch("inclusions");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function loadMeta() {
      const [destRes, catRes] = await Promise.all([
        fetch("/api/admin/destinations"),
        fetch("/api/admin/categories"),
      ]);
      const [destData, catData] = await Promise.all([destRes.json(), catRes.json()]);
      if (destData.success) setDestinations(destData.data);
      if (catData.success) setCategories(catData.data);
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (!tripId) return;
    async function load() {
      try {
        const res = await fetch(`/api/admin/trips/${tripId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Trip not found");
          router.push("/admin/trips");
          return;
        }
        const normalized = normalizeTrip(result.data);
        reset(normalized);
        setPreviewSlug(normalized.slug);
      } catch {
        toast.error("Failed to load trip");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId, reset, router]);

  async function saveTrip(data: AdminTripFormValues, options?: { publish?: boolean; stay?: boolean }) {
    setSubmitting(true);
    try {
      if (options?.publish) {
        const check = publishTripSchema.safeParse(data);
        if (!check.success) {
          const issue = check.error.issues[0];
          const message = issue?.message ?? "Cannot publish — missing required fields";
          const fieldPath = issue?.path.join(".") ?? "";
          const tab = resolveTabForField(fieldPath, TRIP_TAB_FIELD_RULES, "basics");
          setActiveTab(tab);
          if (issue?.path[0] === "coverImageId") {
            setError("coverImageId", { type: "manual", message });
          }
          showValidationToast(message, TRIP_TAB_LABELS[tab]);
          setSubmitting(false);
          return;
        }
        data = { ...data, status: "published" };
      }

      const url = isEdit ? `/api/admin/trips/${tripId}` : "/api/admin/trips";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to save trip");
        return;
      }

      toast.success(
        options?.publish ? "Trip published" : isEdit ? "Trip saved" : "Trip created"
      );

      if (options?.stay && isEdit) {
        reset(data);
        setPreviewSlug(data.slug);
      } else if (!isEdit) {
        router.push(`/admin/trips/${result.data.id}`);
      } else if (!options?.stay) {
        router.push("/admin/trips");
      } else {
        reset(data);
      }
    } catch {
      toast.error("Failed to save trip");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleCategory(id: string) {
    const current = watch("categoryIds");
    setValue(
      "categoryIds",
      current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
      { shouldDirty: true }
    );
  }

  function addInclusionTemplate(template: string) {
    setValue(
      "inclusions",
      [
        ...watchedInclusions,
        { id: `inc-${Date.now()}`, text: template },
      ],
      { shouldDirty: true }
    );
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Trip" : "New Trip"}
        description="Build a complete travel product with itinerary, pricing, and publish workflow."
        action={
          <div className="flex gap-2">
            {isEdit && previewSlug && (
              <Button variant="outline" asChild>
                <Link href={`/preview/trips/${previewSlug}`} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
            {isEdit && (
              <Button variant="outline" asChild>
                <Link href={`/admin/trips/${tripId}/departures`}>Departures</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/trips">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-1 border-b pb-1">
        {TRIP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
              tabsWithErrors.has(tab.id) && activeTab !== tab.id && "text-destructive"
            )}
          >
            {tab.label}
            {tabsWithErrors.has(tab.id) && (
              <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <form className="space-y-6 max-w-3xl">
        {activeTab === "basics" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} disabled={readOnly} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <Controller
                control={control}
                name="slug"
                render={({ field }) => (
                  <SlugField
                    value={field.value}
                    onChange={field.onChange}
                    sourceValue={title}
                    disabled={readOnly}
                    error={errors.slug?.message}
                  />
                )}
              />
              <div className="space-y-2">
                <Label htmlFor="destinationId">Destination</Label>
                <Select id="destinationId" {...register("destinationId")} disabled={readOnly}>
                  <option value="">Select destination</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
                {errors.destinationId && (
                  <p className="text-sm text-destructive">{errors.destinationId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium",
                        watch("categoryIds").includes(cat.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tripType">Trip type</Label>
                  <Select id="tripType" {...register("tripType")} disabled={readOnly}>
                    {Object.entries(TRIP_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select id="difficulty" {...register("difficulty")} disabled={readOnly}>
                    {Object.entries(TRIP_DIFFICULTY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Days</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={1}
                    {...register("durationDays")}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationNights">Nights</Label>
                  <Input
                    id="durationNights"
                    type="number"
                    min={0}
                    {...register("durationNights")}
                    disabled={readOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupSize">Max group size</Label>
                  <Input
                    id="maxGroupSize"
                    type="number"
                    min={1}
                    {...register("maxGroupSize")}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minAge">Min age (optional)</Label>
                <Input
                  id="minAge"
                  type="number"
                  min={0}
                  {...register("minAge", {
                    setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
                  })}
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAltitude">Max altitude (optional)</Label>
                <Input
                  id="maxAltitude"
                  {...register("maxAltitude", {
                    setValueAs: (v) => (v === "" || v == null ? null : String(v)),
                  })}
                  disabled={readOnly}
                  placeholder="e.g. 5,359m (Khardung La)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Short summary</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  {...register("summary")}
                  disabled={readOnly}
                  placeholder="Card excerpt shown in listings"
                />
                {errors.summary && (
                  <p className="text-sm text-destructive">{errors.summary.message}</p>
                )}
              </div>
              <Controller
                control={control}
                name="coverImageId"
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(m) => field.onChange(m?.id ?? null)}
                    accept="image"
                    label="Cover image"
                    disabled={readOnly}
                  />
                )}
              />
              {errors.coverImageId && (
                <p className="text-sm text-destructive">{errors.coverImageId.message}</p>
              )}
              <div className="space-y-2 border-t pt-4">
                <Controller
                  control={control}
                  name="gallery"
                  render={({ field }) => (
                    <MediaGalleryPicker
                      value={field.value}
                      onChange={field.onChange}
                      label="Gallery"
                      disabled={readOnly}
                    />
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
                    Featured trip
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "overview" && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Controller
                control={control}
                name="overview.content"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>Long description</Label>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="overview.highlights"
                render={({ field }) => (
                  <RepeaterField
                    label="Highlights"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="Highlight bullet"
                  />
                )}
              />
              <Controller
                control={control}
                name="overview.routeMapEmbed"
                render={({ field }) => (
                  <MapEmbedField
                    value={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    label="Route map embed"
                  />
                )}
              />
              <Controller
                control={control}
                name="overview.routeMapImageId"
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(m) => field.onChange(m?.id ?? null)}
                    accept="image"
                    label="Route map image (alternative)"
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "itinerary" && (
          <Card>
            <CardContent className="pt-6">
              <Controller
                control={control}
                name="itinerary"
                render={({ field }) => (
                  <DayItineraryEditor
                    days={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "inclusions" && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              {!readOnly && (
                <div className="flex flex-wrap gap-2">
                  {INCLUSION_TEMPLATES.map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addInclusionTemplate(t)}
                    >
                      + {t}
                    </Button>
                  ))}
                </div>
              )}
              <Controller
                control={control}
                name="inclusions"
                render={({ field }) => (
                  <RepeaterField
                    label="Inclusions"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="What's included"
                  />
                )}
              />
              <Controller
                control={control}
                name="exclusions"
                render={({ field }) => (
                  <RepeaterField
                    label="Exclusions"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="What's not included"
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "policies" && (
          <Card>
            <CardContent className="pt-6 space-y-6">
              <Controller
                control={control}
                name="thingsToCarry"
                render={({ field }) => (
                  <RepeaterField
                    label="Things to carry"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="Item travelers should pack"
                  />
                )}
              />
              <Controller
                control={control}
                name="cancellationPolicy"
                render={({ field }) => (
                  <RepeaterField
                    label="Cancellation policy"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="Cancellation rule"
                  />
                )}
              />
              <Controller
                control={control}
                name="refundPolicy"
                render={({ field }) => (
                  <RepeaterField
                    label="Refund policy"
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="Refund rule"
                  />
                )}
              />
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

        {activeTab === "testimonials" && (
          <Card>
            <CardContent className="pt-6">
              <Controller
                control={control}
                name="testimonials"
                render={({ field }) => (
                  <TestimonialPicker
                    items={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === "pricing" && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pricePer">Price per</Label>
                <Select
                  id="pricePer"
                  value={watchedPricing.pricePer}
                  onChange={(e) =>
                    setValue(
                      "pricing",
                      {
                        ...watchedPricing,
                        pricePer: e.target.value as AdminTripFormValues["pricing"]["pricePer"],
                      },
                      { shouldDirty: true }
                    )
                  }
                  disabled={readOnly}
                >
                  <option value="person">Per person</option>
                  <option value="bike">Per bike</option>
                  <option value="couple">Per couple</option>
                </Select>
              </div>
              <PriceInput
                pricing={watchedPricing}
                onChange={(p) => setValue("pricing", p, { shouldDirty: true })}
                disabled={readOnly}
              />
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
          <div className="space-y-3">
            {isSubmitted && tabsWithErrors.size > 0 && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                Please fix the required fields highlighted in red. Tabs with errors are
                marked with a red dot.
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={submitting}
                onClick={handleSubmit((data) => saveTrip(data, { stay: true }), onInvalid)}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save draft
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={handleSubmit(
                  (data) => saveTrip(data, { publish: true, stay: true }),
                  onInvalid
                )}
              >
                Publish
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={handleSubmit((data) => saveTrip(data), onInvalid)}
              >
                Save & close
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
