"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BANNER_PLACEMENTS } from "@/types/banner";
import type { Destination } from "@/types/destination";
import { bannerFormSchema, type BannerFormValues } from "@/lib/validations/banner";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { UserRole } from "@/types/auth";

interface BannerFormProps {
  bannerId?: string;
  userRole: UserRole;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function BannerForm({ bannerId, userRole }: BannerFormProps) {
  const router = useRouter();
  const isEdit = !!bannerId;
  const readOnly = userRole === "viewer";
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema) as Resolver<BannerFormValues>,
    defaultValues: {
      title: "",
      placement: "homepage_hero",
      mediaType: "image",
      mediaId: null,
      headline: "",
      subheadline: "",
      linkUrl: "",
      ctaButtons: [],
      startsAt: null,
      endsAt: null,
      sortOrder: 0,
      isActive: true,
      destinationId: null,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ctaButtons",
  });

  const mediaType = watch("mediaType");
  const placement = watch("placement");
  const [destinations, setDestinations] = useState<Destination[]>([]);

  useEffect(() => {
    if (placement !== "destination_page") return;
    async function load() {
      try {
        const res = await fetch("/api/admin/destinations");
        const result = await res.json();
        if (result.success) {
          setDestinations(
            result.data.filter((d: Destination) => d.status === "published")
          );
        }
      } catch {
        // non-blocking
      }
    }
    load();
  }, [placement]);

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    if (!bannerId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/banners/${bannerId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Banner not found");
          router.push("/admin/banners");
          return;
        }
        const b = result.data;
        reset({
          title: b.title,
          placement: b.placement,
          mediaType: b.mediaType,
          mediaId: b.mediaId,
          headline: b.headline,
          subheadline: b.subheadline,
          linkUrl: b.linkUrl,
          ctaButtons: b.ctaButtons,
          startsAt: b.startsAt,
          endsAt: b.endsAt,
          sortOrder: b.sortOrder,
          isActive: b.isActive,
          destinationId: b.destinationId ?? null,
        });
      } catch {
        toast.error("Failed to load banner");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bannerId, reset, router]);

  async function onSubmit(data: BannerFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/banners/${bannerId}` : "/api/admin/banners";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to save banner");
        return;
      }

      toast.success(isEdit ? "Banner updated successfully" : "Banner created successfully");
      router.push("/admin/banners");
      router.refresh();
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Banner" : "Add Banner"}
        description="Configure banner content, media, CTAs, and scheduling."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/banners">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Banner title (internal)</Label>
                <Input id="title" {...register("title")} disabled={readOnly} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <Controller
                  name="placement"
                  control={control}
                  render={({ field }) => (
                    <Select id="placement" value={field.value} onChange={field.onChange} disabled={readOnly}>
                      {Object.entries(BANNER_PLACEMENTS).map(([key, val]) => (
                        <option key={key} value={key}>
                          {val.label}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              {placement === "destination_page" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="destinationId">Linked destination</Label>
                  <Controller
                    name="destinationId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        id="destinationId"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const destId = e.target.value || null;
                          field.onChange(destId);
                          const dest = destinations.find((d) => d.id === destId);
                          if (dest) {
                            setValue("linkUrl", `/destinations/${dest.slug}`);
                          }
                        }}
                        disabled={readOnly}
                      >
                        <option value="">Select destination…</option>
                        {destinations.map((dest) => (
                          <option key={dest.id} value={dest.id}>
                            {dest.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <p className="text-xs text-muted-foreground">
                    {BANNER_PLACEMENTS.destination_page.description}
                  </p>
                </div>
              )}

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
            </div>

            <div className="space-y-3">
              <Label>Media type</Label>
              <Controller
                name="mediaType"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    {(["image", "video"] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={field.value === type ? "default" : "outline"}
                        size="sm"
                        disabled={readOnly}
                        onClick={() => {
                          field.onChange(type);
                          setValue("mediaId", null);
                        }}
                      >
                        {type === "image" ? "Image" : "Video"}
                      </Button>
                    ))}
                  </div>
                )}
              />
              <Controller
                name="mediaId"
                control={control}
                render={({ field }) => (
                  <MediaPicker
                    value={field.value}
                    onChange={(media) => field.onChange(media?.id ?? null)}
                    accept={mediaType}
                    label={`Select ${mediaType}`}
                    disabled={readOnly}
                  />
                )}
              />
              {errors.mediaId && (
                <p className="text-sm text-destructive">{errors.mediaId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" {...register("headline")} disabled={readOnly} />
              {errors.headline && (
                <p className="text-sm text-destructive">{errors.headline.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheadline">Subheadline</Label>
              <Input id="subheadline" {...register("subheadline")} disabled={readOnly} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkUrl">Banner link URL (optional)</Label>
              <Input
                id="linkUrl"
                placeholder="/trips or https://..."
                {...register("linkUrl")}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>CTA Buttons</Label>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        id: `cta-${Date.now()}`,
                        label: "",
                        url: "",
                        style: "primary",
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add CTA
                  </Button>
                )}
              </div>

              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">No CTA buttons added.</p>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border p-4 sm:grid-cols-3"
                >
                  <div className="space-y-1">
                    <Label>Label</Label>
                    <Input
                      {...register(`ctaButtons.${index}.label`)}
                      disabled={readOnly}
                    />
                    {errors.ctaButtons?.[index]?.label && (
                      <p className="text-xs text-destructive">
                        {errors.ctaButtons[index]?.label?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>URL</Label>
                    <Input
                      {...register(`ctaButtons.${index}.url`)}
                      disabled={readOnly}
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label>Style</Label>
                      <Controller
                        name={`ctaButtons.${index}.style`}
                        control={control}
                        render={({ field: f }) => (
                          <Select value={f.value} onChange={f.onChange} disabled={readOnly}>
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="outline">Outline</option>
                          </Select>
                        )}
                      />
                    </div>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startsAt">Start date (optional)</Label>
                <Controller
                  name="startsAt"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="startsAt"
                      type="datetime-local"
                      disabled={readOnly}
                      value={toDatetimeLocal(field.value)}
                      onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endsAt">End date (optional)</Label>
                <Controller
                  name="endsAt"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="endsAt"
                      type="datetime-local"
                      disabled={readOnly}
                      value={toDatetimeLocal(field.value)}
                      onChange={(e) => field.onChange(fromDatetimeLocal(e.target.value))}
                    />
                  )}
                />
                {errors.endsAt && (
                  <p className="text-sm text-destructive">{errors.endsAt.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    className="h-4 w-4 rounded accent-primary"
                  />
                )}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active banner
              </Label>
            </div>

            {!readOnly && (
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving...
                    </>
                  ) : isEdit ? (
                    "Update Banner"
                  ) : (
                    "Create Banner"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/banners">Cancel</Link>
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
