"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { SerpPreview } from "@/components/admin/seo/SerpPreview";
import { CharacterCounter } from "@/components/admin/seo/CharacterCounter";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { seoFormSchema, type SeoFormValues } from "@/lib/validations/seo";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

interface SeoEditFormProps {
  pageKey: string;
  userRole: UserRole;
}

export function SeoEditForm({ pageKey, userRole }: SeoEditFormProps) {
  const router = useRouter();
  const readOnly = userRole === "viewer";
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [pageLabel, setPageLabel] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [isPlaceholder, setIsPlaceholder] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      metaTitle: "",
      metaDescription: "",
      ogImageId: null,
      canonicalUrl: "",
      robots: "index, follow",
      schemaJson: "",
    },
  });

  const watchedTitle = watch("metaTitle");
  const watchedDescription = watch("metaDescription");
  const watchedUrl = watch("canonicalUrl");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/seo/${pageKey}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Page not found");
          router.push("/admin/seo");
          return;
        }
        const data = result.data;
        setPageLabel(data.label);
        setPagePath(data.path);
        setIsPlaceholder(data.isPlaceholder ?? false);
        reset({
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          ogImageId: data.ogImageId,
          canonicalUrl: data.canonicalUrl,
          robots: data.robots,
          schemaJson: data.schemaJson,
        });
      } catch {
        toast.error("Failed to load SEO settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pageKey, reset, router]);

  async function onSubmit(data: SeoFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/seo/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to save SEO settings");
        return;
      }
      toast.success("SEO settings updated");
    } catch {
      toast.error("Failed to save SEO settings");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch(`/api/admin/seo/${pageKey}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.errors?.form || "Failed to reset");
        return;
      }
      const data = result.data;
      reset({
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogImageId: data.ogImageId,
        canonicalUrl: data.canonicalUrl,
        robots: data.robots,
        schemaJson: data.schemaJson,
      });
      toast.success("SEO settings reset to defaults");
      setResetOpen(false);
    } catch {
      toast.error("Failed to reset SEO settings");
    } finally {
      setResetting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageLabel}
        description={`SEO settings for ${pagePath}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/seo">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <CharacterCounter
                    current={watchedTitle?.length ?? 0}
                    recommended={60}
                  />
                </div>
                <Input
                  id="metaTitle"
                  {...register("metaTitle")}
                  disabled={readOnly}
                />
                {errors.metaTitle && (
                  <p className="text-sm text-destructive">
                    {errors.metaTitle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <CharacterCounter
                    current={watchedDescription?.length ?? 0}
                    recommended={160}
                  />
                </div>
                <textarea
                  id="metaDescription"
                  rows={3}
                  disabled={readOnly}
                  className={cn(
                    "flex w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  {...register("metaDescription")}
                />
                {errors.metaDescription && (
                  <p className="text-sm text-destructive">
                    {errors.metaDescription.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>OG Image</Label>
                <Controller
                  name="ogImageId"
                  control={control}
                  render={({ field }) => (
                    <MediaPicker
                      value={field.value}
                      onChange={(media) => field.onChange(media?.id ?? null)}
                      accept="image"
                      label="Select OG image"
                      disabled={readOnly}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">Canonical URL</Label>
                <Input
                  id="canonicalUrl"
                  placeholder="https://backpackclan.com/page"
                  {...register("canonicalUrl")}
                  disabled={readOnly}
                />
                {errors.canonicalUrl && (
                  <p className="text-sm text-destructive">
                    {errors.canonicalUrl.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots">Robots</Label>
                <Controller
                  name="robots"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="robots"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      disabled={readOnly}
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">No Index, Follow</option>
                      <option value="index, nofollow">Index, No Follow</option>
                      <option value="noindex, nofollow">No Index, No Follow</option>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schemaJson">JSON-LD Schema (optional)</Label>
                <textarea
                  id="schemaJson"
                  rows={6}
                  disabled={readOnly}
                  placeholder='{"@context": "https://schema.org", ...}'
                  className={cn(
                    "flex w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  {...register("schemaJson")}
                />
              </div>

              {!readOnly && (
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save SEO Settings"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetOpen(true)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <SerpPreview
          title={watchedTitle}
          description={watchedDescription}
          url={watchedUrl}
        />
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset SEO settings"
        description={`Reset "${pageLabel}" SEO settings to defaults? Your current changes will be lost.`}
        confirmLabel="Reset"
        variant="destructive"
        loading={resetting}
        onConfirm={handleReset}
      />
    </div>
  );
}
