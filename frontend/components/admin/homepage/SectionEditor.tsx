"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  Controller,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { ArrowLeft, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type {
  HomepageSection,
  HomepageSectionContent,
  HomepageSectionType,
} from "@/types/homepage";
import type { UserRole } from "@/types/auth";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { DestinationMultiSelect } from "@/components/admin/homepage/DestinationMultiSelect";
import { TripMultiSelect } from "@/components/admin/homepage/TripMultiSelect";

interface SectionEditorProps {
  slug: string;
  userRole: UserRole;
}

type FormProps = {
  register: UseFormRegister<HomepageSectionContent>;
  control: Control<HomepageSectionContent>;
  watch: UseFormWatch<HomepageSectionContent>;
  setValue: UseFormSetValue<HomepageSectionContent>;
  readOnly: boolean;
};

export function SectionEditor({ slug, userRole }: SectionEditorProps) {
  const router = useRouter();
  const readOnly = userRole === "viewer";
  const [section, setSection] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, reset, watch, setValue, formState: { isDirty } } =
    useForm<HomepageSectionContent>();

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/homepage/sections/${slug}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Section not found");
          router.push("/admin/homepage");
          return;
        }
        setSection(result.data);
        const content = { ...result.data.content };
        if (result.data.type === "featured_destinations") {
          const c = content as import("@/types/homepage").FeaturedDestinationsContent;
          reset({
            ...c,
            destinationIds: c.destinationIds ?? [],
            cards: c.cards ?? [],
          });
        } else if (result.data.type === "popular_trips") {
          const c = content as import("@/types/homepage").PopularTripsContent;
          reset({
            ...c,
            mode: c.mode ?? "featured",
            tripIds: c.tripIds ?? [],
          });
        } else if (result.data.type === "blog_highlights") {
          const c = content as import("@/types/homepage").BlogHighlightsContent;
          reset({
            ...c,
            mode: c.mode ?? "latest",
            postIds: c.postIds ?? [],
            posts: c.posts ?? [],
          });
        } else if (result.data.type === "category_showcase") {
          const c = content as import("@/types/homepage").CategoryShowcaseContent;
          reset({
            ...c,
            tabs: (c.tabs ?? []).map((t) => ({
              ...t,
              title: t.title ?? "",
              subtitle: t.subtitle ?? "",
              href: t.href ?? "",
              showcaseType: t.showcaseType ?? "destinations",
              destinationIds: t.destinationIds ?? [],
              tripIds: t.tripIds ?? [],
              items: t.items ?? [],
              bannerImageId: t.bannerImageId ?? null,
              bannerVideoId: t.bannerVideoId ?? null,
            })),
          });
        } else if (result.data.type === "accreditations") {
          const c = content as import("@/types/homepage").AccreditationsContent;
          reset({
            ...c,
            items: c.items ?? [],
          });
        } else if (result.data.type === "gallery") {
          const c = content as import("@/types/homepage").GalleryContent;
          const legacyIds = c.imageIds ?? [];
          const items =
            c.items && c.items.length > 0
              ? c.items
              : legacyIds.map((imageId, index) => ({
                  id: `mem-${imageId}-${index}`,
                  imageId,
                  caption: "",
                }));
          reset({
            title: c.title ?? "",
            eyebrow: c.eyebrow ?? "Postcards of memories",
            description:
              c.description ??
              "Real frames from our batches — polaroids worth pinning to the fridge.",
            imageIds: legacyIds,
            items,
          });
        } else {
          reset(content);
        }
      } catch {
        toast.error("Failed to load section");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, reset, router]);

  async function onSubmit(data: HomepageSectionContent) {
    setSubmitting(true);
    try {
      let payload = data;
      if (section?.type === "gallery") {
        const gallery = data as import("@/types/homepage").GalleryContent;
        const items = gallery.items ?? [];
        payload = {
          ...gallery,
          imageIds: items
            .map((item) => item.imageId)
            .filter((id): id is string => Boolean(id)),
          items,
        };
      }

      const res = await fetch(`/api/admin/homepage/sections/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error("Failed to save section");
        return;
      }
      toast.success("Section updated successfully");
    } catch {
      toast.error("Failed to save section");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !section) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${section.title}`}
        description={`Configure content for the ${section.title} section.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/preview/homepage" target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/homepage">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <SectionFormFields
              type={section.type}
              register={register}
              control={control}
              watch={watch}
              setValue={setValue}
              readOnly={readOnly}
            />
            {!readOnly && (
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Section"
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/homepage">Cancel</Link>
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionFormFields({
  type,
  ...props
}: FormProps & { type: HomepageSectionType }) {
  switch (type) {
    case "hero":
      return <HeroForm {...props} />;
    case "featured_destinations":
      return <FeaturedDestinationsForm {...props} />;
    case "popular_trips":
      return <PopularTripsForm {...props} />;
    case "why_choose_us":
      return <WhyChooseUsForm {...props} />;
    case "testimonials":
      return <TestimonialsForm {...props} />;
    case "youtube_videos":
      return <YoutubeVideosForm {...props} />;
    case "gallery":
      return <GalleryForm {...props} />;
    case "blog_highlights":
      return <BlogHighlightsForm {...props} />;
    case "newsletter_cta":
      return <NewsletterForm {...props} />;
    case "partner_logos":
      return <PartnerLogosForm {...props} />;
    case "accreditations":
      return <AccreditationsForm {...props} />;
    case "faq_strip":
      return <FaqForm {...props} />;
    case "category_showcase":
      return <CategoryShowcaseForm {...props} />;
    default:
      return <p className="text-muted-foreground">Unknown section type.</p>;
  }
}

function RepeaterHeader({
  label,
  onAdd,
  readOnly,
}: {
  label: string;
  onAdd: () => void;
  readOnly: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      )}
    </div>
  );
}

function HeroForm({ register, control, watch, setValue, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({
    control: control as Control<HomepageSectionContent & { ctas: unknown[] }>,
    name: "ctas" as const,
  });
  const mediaType = watch("mediaType" as never) as unknown as "image" | "video" | undefined;

  return (
    <>
      <Field label="Headline" name="headline" register={register} readOnly={readOnly} />
      <Field label="Subheadline" name="subheadline" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Media</Label>
        <div className="flex gap-2">
          {(["image", "video"] as const).map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={mediaType === t ? "default" : "outline"}
              disabled={readOnly}
              onClick={() => {
                setValue("mediaType" as never, t as never);
                setValue("mediaId" as never, null as never);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
        <MediaPicker
          value={watch("mediaId" as never) as unknown as string | null}
          onChange={(m) => setValue("mediaId" as never, (m?.id ?? null) as never)}
          accept={mediaType ?? "image"}
          disabled={readOnly}
        />
      </div>
      {mediaType === "video" ? (
        <div className="space-y-2">
          <Label>Poster image</Label>
          <MediaPicker
            value={watch("posterMediaId" as never) as unknown as string | null}
            onChange={(m) => setValue("posterMediaId" as never, (m?.id ?? null) as never)}
            accept="image"
            disabled={readOnly}
          />
        </div>
      ) : null}
      <Field label="Eyebrow (optional)" name="eyebrow" register={register} readOnly={readOnly} />
      <RepeaterHeader
        label="CTA buttons"
        readOnly={readOnly}
        onAdd={() => append({ label: "", url: "", style: "primary" } as never)}
      />
      {fields.map((field, i) => (
        <div key={field.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-3">
          <Input {...register(`ctas.${i}.label` as never)} placeholder="Label" disabled={readOnly} />
          <Input {...register(`ctas.${i}.url` as never)} placeholder="URL" disabled={readOnly} />
          <div className="flex gap-2">
            <Input {...register(`ctas.${i}.style` as never)} placeholder="primary" disabled={readOnly} />
            {!readOnly && (
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function FeaturedDestinationsForm({ register, control, readOnly }: FormProps) {
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <Controller
        control={control}
        name={"destinationIds" as never}
        render={({ field }) => (
          <DestinationMultiSelect
            value={(field.value as string[]) ?? []}
            onChange={field.onChange}
            disabled={readOnly}
            label="Featured destinations"
            hint="Pick published destinations — cards are built automatically from live data."
          />
        )}
      />
    </>
  );
}

function PopularTripsForm({ register, control, watch, readOnly }: FormProps) {
  const mode = (watch() as import("@/types/homepage").PopularTripsContent).mode ?? "featured";

  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Trip selection</Label>
        <Controller
          control={control}
          name={"mode" as never}
          render={({ field }) => (
            <Select value={(field.value as string) ?? "featured"} onChange={field.onChange} disabled={readOnly}>
              <option value="featured">Auto — featured published trips</option>
              <option value="manual">Manual — pick specific trips</option>
            </Select>
          )}
        />
      </div>
      {mode === "manual" && (
        <Controller
          control={control}
          name={"tripIds" as never}
          render={({ field }) => (
            <TripMultiSelect
              value={(field.value as string[]) ?? []}
              onChange={field.onChange}
              disabled={readOnly}
              label="Trips to show"
              hint="Pick and order the trips shown in this homepage section."
            />
          )}
        />
      )}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Controller
          control={control}
          name={"layout" as never}
          render={({ field }) => (
            <Select value={field.value as string} onChange={field.onChange} disabled={readOnly}>
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Filter tags (comma-separated)</Label>
        <Controller
          control={control}
          name={"filterTags" as never}
          render={({ field }) => (
            <Input
              value={
                Array.isArray(field.value as unknown)
                  ? (field.value as unknown as string[]).join(", ")
                  : ""
              }
              onChange={(e) =>
                field.onChange(
                  e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                )
              }
              disabled={readOnly}
              placeholder="Bike Tour, Trek, Guaranteed Departures"
            />
          )}
        />
        <p className="text-xs text-muted-foreground">
          Category filter chips shown on the homepage carousel.
        </p>
      </div>
    </>
  );
}

function WhyChooseUsForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "blocks" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader label="Feature blocks" readOnly={readOnly} onAdd={() => append({ id: `w-${Date.now()}`, icon: "Star", title: "", description: "" } as never)} />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`blocks.${i}.icon` as never)} placeholder="Icon" disabled={readOnly} />
          <Input {...register(`blocks.${i}.title` as never)} placeholder="Title" disabled={readOnly} />
          <RichTextField
            control={control}
            name={`blocks.${i}.description`}
            label="Description"
            readOnly={readOnly}
          />
          {!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
        </div>
      ))}
    </>
  );
}

function TestimonialsForm({ register, control, watch, setValue, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });
  return (
    <>
      <Field label="Eyebrow" name="eyebrow" register={register} readOnly={readOnly} />
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader
        label="Testimonials"
        readOnly={readOnly}
        onAdd={() =>
          append({
            id: `t-${Date.now()}`,
            name: "",
            trip: "",
            rating: 5,
            text: "",
            avatarId: null,
            tripHref: "/trips",
            tripImageId: null,
            tripImageUrl: null,
            reviewUrl: null,
          } as never)
        }
      />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`items.${i}.name` as never)} placeholder="Name" disabled={readOnly} />
          <Input {...register(`items.${i}.trip` as never)} placeholder="Trip name" disabled={readOnly} />
          <Input {...register(`items.${i}.tripHref` as never)} placeholder="Trip link (e.g. /trips/slug)" disabled={readOnly} />
          <Input {...register(`items.${i}.reviewUrl` as never)} placeholder="External review URL (optional)" disabled={readOnly} />
          <Input type="number" min={1} max={5} {...register(`items.${i}.rating` as never, { valueAsNumber: true })} placeholder="Rating" disabled={readOnly} />
          <div className="space-y-2">
            <Label>Trip thumbnail</Label>
            <MediaPicker
              value={watch(`items.${i}.tripImageId` as never) as unknown as string | null}
              onChange={(m) => setValue(`items.${i}.tripImageId` as never, (m?.id ?? null) as never)}
              accept="image"
              disabled={readOnly}
            />
          </div>
          <RichTextField
            control={control}
            name={`items.${i}.text`}
            label="Review"
            readOnly={readOnly}
          />
          {!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
        </div>
      ))}
    </>
  );
}

function YoutubeVideosForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });
  return (
    <>
      <Field label="Eyebrow" name="eyebrow" register={register} readOnly={readOnly} />
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader
        label="YouTube videos"
        readOnly={readOnly}
        onAdd={() =>
          append({
            id: `yt-${Date.now()}`,
            youtubeUrl: "",
            title: "",
            thumbnailUrl: null,
          } as never)
        }
      />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input
            {...register(`items.${i}.title` as never)}
            placeholder="Video title (optional)"
            disabled={readOnly}
          />
          <Input
            {...register(`items.${i}.youtubeUrl` as never)}
            placeholder="YouTube URL or video ID"
            disabled={readOnly}
          />
          <Input
            {...register(`items.${i}.thumbnailUrl` as never)}
            placeholder="Custom thumbnail URL (optional)"
            disabled={readOnly}
          />
          {!readOnly && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
    </>
  );
}

function GalleryForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });

  return (
    <>
      <Field label="Eyebrow" name="eyebrow" register={register} readOnly={readOnly} />
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          {...register("description" as never)}
          disabled={readOnly}
          placeholder="Short supporting line under the title"
        />
      </div>
      <RepeaterHeader
        label="Postcard photos (up to 6)"
        readOnly={readOnly}
        onAdd={() =>
          append({
            id: `mem-${Date.now()}`,
            imageId: null,
            caption: "",
          } as never)
        }
      />
      <p className="text-xs text-muted-foreground">
        Each photo shows as a polaroid on the homepage. Add a short caption for the handwritten label.
      </p>
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Photo {i + 1}</p>
            {!readOnly && (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <MediaPickerController control={control} name={`items.${i}.imageId`} readOnly={readOnly} />
          <Input
            {...register(`items.${i}.caption` as never)}
            placeholder="Caption (e.g. Spiti nights)"
            disabled={readOnly}
          />
        </div>
      ))}
    </>
  );
}

function BlogHighlightsForm({ register, control, readOnly }: FormProps) {
  const [posts, setPosts] = useState<
    { id: string; title: string; slug: string; status: string }[]
  >([]);
  const mode = useWatch({ control, name: "mode" as never }) as string | undefined;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/blogs");
        const result = await res.json();
        if (result.success) {
          setPosts(
            result.data.filter((p: { status: string }) => p.status === "published")
          );
        }
      } catch {
        // non-blocking
      }
    }
    load();
  }, []);

  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Post selection</Label>
        <Select {...register("mode" as never)} disabled={readOnly}>
          <option value="latest">Latest published posts</option>
          <option value="manual">Pick specific posts</option>
        </Select>
      </div>
      {mode === "manual" ? (
        <div className="space-y-2">
          <Label>Featured posts (up to 3)</Label>
          <p className="text-xs text-muted-foreground">
            First selected post appears as the large featured card.
          </p>
          <Controller
            control={control}
            name={"postIds" as never}
            render={({ field }) => {
              const selected = (field.value as string[]) ?? [];
              return (
                <div className="space-y-2 rounded-lg border p-4 max-h-64 overflow-y-auto">
                  {posts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No published posts.</p>
                  ) : (
                    posts.map((post) => (
                      <label key={post.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selected.includes(post.id)}
                          disabled={readOnly}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...selected, post.id]
                              : selected.filter((id) => id !== post.id);
                            field.onChange(next.slice(0, 3));
                          }}
                          className="rounded border-input"
                        />
                        {post.title}
                        <span className="text-muted-foreground">/blog/{post.slug}</span>
                      </label>
                    ))
                  )}
                </div>
              );
            }}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          The 3 most recently published blog posts are shown automatically.
        </p>
      )}
    </>
  );
}

function NewsletterForm({ register, control, readOnly }: FormProps) {
  return (
    <>
      <Field label="Headline" name="headline" register={register} readOnly={readOnly} />
      <RichTextField
        control={control}
        name="description"
        label="Description"
        readOnly={readOnly}
      />
      <Field label="Button text" name="buttonText" register={register} readOnly={readOnly} />
      <Field label="Email placeholder" name="placeholder" register={register} readOnly={readOnly} />
      <Field
        label="Secondary button text"
        name="secondaryButtonText"
        register={register}
        readOnly={readOnly}
      />
      <Field
        label="Secondary button URL"
        name="secondaryButtonUrl"
        register={register}
        readOnly={readOnly}
      />
    </>
  );
}

function CategoryShowcaseForm({ register, control, watch, setValue, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({
    control: control as Control<HomepageSectionContent & { tabs: unknown[] }>,
    name: "tabs" as const,
  });

  return (
    <>
      <p className="rounded-md border border-dashed bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
        Section defaults below are used when a tab leaves Title / Subtitle / View all / Banner empty.
      </p>
      <Field label="Default title" name="title" register={register} readOnly={readOnly} />
      <Field label="Default subtitle" name="subtitle" register={register} readOnly={readOnly} />
      <Field label="Default view all URL" name="href" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Layout</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={(watch("layout" as never) as unknown as string) ?? "banner-below"}
          disabled={readOnly}
          onChange={(e) => setValue("layout" as never, e.target.value as never)}
        >
          <option value="banner-below">Banner + cards below</option>
          <option value="sidebar">Sidebar cards + banner</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Default banner video</Label>
        <MediaPicker
          value={watch("videoMediaId" as never) as unknown as string | null}
          onChange={(m) => setValue("videoMediaId" as never, (m?.id ?? null) as never)}
          accept="video"
          disabled={readOnly}
        />
      </div>
      <div className="space-y-2">
        <Label>Default banner image</Label>
        <MediaPicker
          value={watch("posterMediaId" as never) as unknown as string | null}
          onChange={(m) => setValue("posterMediaId" as never, (m?.id ?? null) as never)}
          accept="image"
          disabled={readOnly}
        />
      </div>
      <RepeaterHeader
        label="Tabs"
        readOnly={readOnly}
        onAdd={() =>
          append({
            id: `tab-${Date.now()}`,
            label: "New tab",
            title: "",
            subtitle: "",
            href: "",
            showcaseType: "destinations",
            destinationIds: [],
            tripIds: [],
            items: [],
            bannerImageId: null,
            bannerVideoId: null,
          } as never)
        }
      />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <Input
              {...register(`tabs.${i}.label` as never)}
              placeholder="Tab pill label (India / International / Month-wise)"
              disabled={readOnly}
            />
            {!readOnly && (
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input
                {...register(`tabs.${i}.title` as never)}
                placeholder="Leave blank to use default title"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Subtitle</Label>
              <Input
                {...register(`tabs.${i}.subtitle` as never)}
                placeholder="Leave blank to use default subtitle"
                disabled={readOnly}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>View all URL</Label>
              <Input
                {...register(`tabs.${i}.href` as never)}
                placeholder="Leave blank to use default view all URL"
                disabled={readOnly}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner image</Label>
            <MediaPicker
              value={watch(`tabs.${i}.bannerImageId` as never) as unknown as string | null}
              onChange={(m) =>
                setValue(`tabs.${i}.bannerImageId` as never, (m?.id ?? null) as never)
              }
              accept="image"
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label>Banner video</Label>
            <MediaPicker
              value={watch(`tabs.${i}.bannerVideoId` as never) as unknown as string | null}
              onChange={(m) =>
                setValue(`tabs.${i}.bannerVideoId` as never, (m?.id ?? null) as never)
              }
              accept="video"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Main card row</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={
                (watch(`tabs.${i}.showcaseType` as never) as unknown as string) ??
                "destinations"
              }
              disabled={readOnly}
              onChange={(e) =>
                setValue(
                  `tabs.${i}.showcaseType` as never,
                  e.target.value as never
                )
              }
            >
              <option value="destinations">Show destinations</option>
              <option value="trips">Show specific trips</option>
            </select>
          </div>

          {(watch(`tabs.${i}.showcaseType` as never) as unknown as string) !==
          "trips" ? (
            <Controller
              control={control}
              name={`tabs.${i}.destinationIds` as never}
              render={({ field: destField }) => (
                <DestinationMultiSelect
                  value={(destField.value as string[]) ?? []}
                  onChange={destField.onChange}
                  disabled={readOnly}
                  label="Destinations"
                  hint="Pick published destinations for this tab — cards build automatically."
                  reorderable
                />
              )}
            />
          ) : (
            <Controller
              control={control}
              name={`tabs.${i}.tripIds` as never}
              render={({ field: tripField }) => (
                <TripMultiSelect
                  value={(tripField.value as string[]) ?? []}
                  onChange={tripField.onChange}
                  disabled={readOnly}
                  label="Trips"
                  hint="Pick the trips shown as cards in this tab."
                />
              )}
            />
          )}

          {(watch(`tabs.${i}.showcaseType` as never) as unknown as string) !==
          "trips" ? (
            <Controller
              control={control}
              name={`tabs.${i}.tripIds` as never}
              render={({ field: tripField }) => (
                <TripMultiSelect
                  value={(tripField.value as string[]) ?? []}
                  onChange={tripField.onChange}
                  disabled={readOnly}
                  label="Featured departures (optional)"
                  hint="Optional trip cards shown below the destination row."
                />
              )}
            />
          ) : null}
        </div>
      ))}
    </>
  );
}

function PartnerLogosForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "logos" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader label="Partner logos" readOnly={readOnly} onAdd={() => append({ id: `p-${Date.now()}`, name: "", imageId: null, link: "" } as never)} />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`logos.${i}.name` as never)} placeholder="Name" disabled={readOnly} />
          <Input {...register(`logos.${i}.link` as never)} placeholder="Link" disabled={readOnly} />
          <MediaPickerController control={control} name={`logos.${i}.imageId`} readOnly={readOnly} />
          {!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
        </div>
      ))}
    </>
  );
}

function AccreditationsForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });
  return (
    <>
      <Field label="Eyebrow" name="eyebrow" register={register} readOnly={readOnly} />
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader
        label="Trust logos / badges"
        readOnly={readOnly}
        onAdd={() =>
          append({
            id: `acc-${Date.now()}`,
            label: "",
            sublabel: "",
            imageId: null,
          } as never)
        }
      />
      <p className="text-xs text-muted-foreground">
        Upload official logos (Google, TripAdvisor, Startup India, MSME, Uttarakhand Tourism, Travelers&apos; Choice).
        Label appears under each logo on the homepage.
      </p>
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Logo {i + 1}</p>
            {!readOnly && (
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <Input
            {...register(`items.${i}.label` as never)}
            placeholder="Title (e.g. MSME)"
            disabled={readOnly}
          />
          <Input
            {...register(`items.${i}.sublabel` as never)}
            placeholder="Optional subtitle"
            disabled={readOnly}
          />
          <MediaPickerController control={control} name={`items.${i}.imageId`} readOnly={readOnly} />
        </div>
      ))}
    </>
  );
}

function FaqForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader label="FAQ items" readOnly={readOnly} onAdd={() => append({ id: `f-${Date.now()}`, question: "", answer: "" } as never)} />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`items.${i}.question` as never)} placeholder="Question" disabled={readOnly} />
          <RichTextField
            control={control}
            name={`items.${i}.answer`}
            label="Answer"
            readOnly={readOnly}
          />
          {!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
        </div>
      ))}
    </>
  );
}

function Field({
  label,
  name,
  register,
  readOnly,
}: {
  label: string;
  name: string;
  register: UseFormRegister<HomepageSectionContent>;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...register(name as never)} disabled={readOnly} />
    </div>
  );
}

function RichTextField({
  control,
  name,
  label,
  readOnly,
}: {
  control: Control<HomepageSectionContent>;
  name: string;
  label: string;
  readOnly: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        control={control}
        name={name as never}
        render={({ field }) => (
          <RichTextEditor
            value={(field.value as string) ?? ""}
            onChange={field.onChange}
            disabled={readOnly}
          />
        )}
      />
    </div>
  );
}

function MediaPickerController({
  control,
  name,
  readOnly,
}: {
  control: Control<HomepageSectionContent>;
  name: string;
  readOnly: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name as never}
      render={({ field }) => (
        <MediaPicker
          value={field.value as string | null}
          onChange={(m) => field.onChange(m?.id ?? null)}
          accept="image"
          disabled={readOnly}
        />
      )}
    />
  );
}
