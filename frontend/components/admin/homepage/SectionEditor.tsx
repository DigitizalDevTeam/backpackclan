"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useFieldArray,
  useForm,
  Controller,
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
        reset(result.data.content);
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
      const res = await fetch(`/api/admin/homepage/sections/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data }),
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
    case "gallery":
      return <GalleryForm {...props} />;
    case "blog_highlights":
      return <BlogHighlightsForm {...props} />;
    case "newsletter_cta":
      return <NewsletterForm {...props} />;
    case "partner_logos":
      return <PartnerLogosForm {...props} />;
    case "faq_strip":
      return <FaqForm {...props} />;
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
    name: "ctas" as "ctas",
  });
  const mediaType = watch("mediaType" as keyof HomepageSectionContent) as
    | "image"
    | "video"
    | undefined;

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
          value={watch("mediaId" as never) as string | null}
          onChange={(m) => setValue("mediaId" as never, (m?.id ?? null) as never)}
          accept={mediaType ?? "image"}
          disabled={readOnly}
        />
      </div>
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
  const { fields, append, remove } = useFieldArray({ control, name: "cards" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader
        label="Destination cards"
        readOnly={readOnly}
        onAdd={() =>
          append({ id: `d-${Date.now()}`, name: "", tripCount: 0, imageId: null, link: "" } as never)
        }
      />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`cards.${i}.name` as never)} placeholder="Name" disabled={readOnly} />
          <Input type="number" {...register(`cards.${i}.tripCount` as never, { valueAsNumber: true })} placeholder="Trip count" disabled={readOnly} />
          <Input {...register(`cards.${i}.link` as never)} placeholder="Link" disabled={readOnly} />
          <MediaPickerController control={control} name={`cards.${i}.imageId`} readOnly={readOnly} />
          {!readOnly && (
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" /> Remove
            </Button>
          )}
        </div>
      ))}
    </>
  );
}

function PopularTripsForm({ register, control, readOnly }: FormProps) {
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
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
              value={Array.isArray(field.value) ? field.value.join(", ") : ""}
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

function TestimonialsForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader label="Testimonials" readOnly={readOnly} onAdd={() => append({ id: `t-${Date.now()}`, name: "", trip: "", rating: 5, text: "", avatarId: null } as never)} />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`items.${i}.name` as never)} placeholder="Name" disabled={readOnly} />
          <Input {...register(`items.${i}.trip` as never)} placeholder="Trip" disabled={readOnly} />
          <Input type="number" min={1} max={5} {...register(`items.${i}.rating` as never, { valueAsNumber: true })} placeholder="Rating" disabled={readOnly} />
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

function GalleryForm({ register, control, watch, setValue, readOnly }: FormProps) {
  const imageIds = (watch("imageIds" as never) as string[]) ?? [];
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <div className="space-y-2">
        <Label>Gallery images</Label>
        {!readOnly && (
          <MediaPicker
            value={null}
            onChange={(m) => {
              if (m) setValue("imageIds" as never, [...imageIds, m.id] as never);
            }}
            accept="image"
            label="Add image"
          />
        )}
        <p className="text-sm text-muted-foreground">{imageIds.length} image(s)</p>
        {!readOnly && imageIds.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={() => setValue("imageIds" as never, [] as never)}>
            Clear all
          </Button>
        )}
      </div>
    </>
  );
}

function BlogHighlightsForm({ register, control, readOnly }: FormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "posts" as never });
  return (
    <>
      <Field label="Section title" name="title" register={register} readOnly={readOnly} />
      <RepeaterHeader label="Blog posts" readOnly={readOnly} onAdd={() => append({ id: `b-${Date.now()}`, title: "", excerpt: "", imageId: null, link: "", date: "" } as never)} />
      {fields.map((field, i) => (
        <div key={field.id} className="space-y-2 rounded-lg border p-4">
          <Input {...register(`posts.${i}.title` as never)} placeholder="Title" disabled={readOnly} />
          <Input {...register(`posts.${i}.excerpt` as never)} placeholder="Excerpt" disabled={readOnly} />
          <Input {...register(`posts.${i}.link` as never)} placeholder="Link" disabled={readOnly} />
          <Input type="date" {...register(`posts.${i}.date` as never)} disabled={readOnly} />
          {!readOnly && <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
        </div>
      ))}
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
