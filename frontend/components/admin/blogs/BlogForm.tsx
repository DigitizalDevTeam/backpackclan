"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RepeaterField } from "@/components/forms/travel";
import { SlugField } from "@/components/forms/travel/SlugField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { blogFormSchema, type BlogFormValues } from "@/lib/validations/blog";
import { collectErrorMessages } from "@/lib/forms/multi-tab-validation";
import { getFormErrorMessage } from "@/lib/api/errors";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { AuthUser } from "@/types/auth";
import type { RepeaterItem } from "@/types/travel";

interface BlogFormProps {
  postId?: string;
  user: AuthUser;
}

function paragraphsToItems(paragraphs: string[]): RepeaterItem[] {
  return paragraphs.map((text, index) => ({
    id: `p-${index}`,
    text,
  }));
}

function itemsToParagraphs(items: RepeaterItem[]): string[] {
  return items.map((item) => item.text);
}

export function BlogForm({ postId, user }: BlogFormProps) {
  const router = useRouter();
  const isEdit = !!postId;
  const canWrite = hasPermission(user, isEdit ? "blogs.update" : "blogs.create");
  const readOnly = !canWrite;

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
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema) as Resolver<BlogFormValues>,
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: [""],
      imageId: null,
      category: "",
      author: "",
      authorRole: "",
      publishedAt: new Date().toISOString().slice(0, 10),
      readTime: undefined,
      tags: [],
      status: "draft",
    },
  });

  const title = watch("title");
  const tagsInput = watch("tags");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    if (!postId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/blogs/${postId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Blog post not found");
          router.push("/admin/blogs");
          return;
        }
        const post = result.data;
        reset({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content.length > 0 ? post.content : [""],
          imageId: post.imageId,
          category: post.category,
          author: post.author,
          authorRole: post.authorRole,
          publishedAt: post.publishedAt,
          readTime: post.readTime,
          tags: post.tags ?? [],
          status: post.status,
        });
      } catch {
        toast.error("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId, reset, router]);

  const tagsString = useMemo(() => (tagsInput ?? []).join(", "), [tagsInput]);

  function onInvalid(errors: FieldErrors<BlogFormValues>) {
    const messages = collectErrorMessages(errors);
    toast.error(messages[0] ?? "Please fix the highlighted fields");
  }

  async function onSubmit(data: BlogFormValues) {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        imageId: data.imageId ?? null,
        content: data.content.map((p) => p.trim()).filter(Boolean),
        readTime: data.readTime && data.readTime > 0 ? data.readTime : undefined,
      };

      const url = isEdit ? `/api/admin/blogs/${postId}` : "/api/admin/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(getFormErrorMessage(result, "Failed to save blog post"));
        return;
      }

      toast.success(isEdit ? "Blog post updated" : "Blog post created");
      router.push("/admin/blogs");
      router.refresh();
    } catch {
      toast.error("Failed to save blog post");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Blog Post" : "New Blog Post"}
        description="Write travel guides and stories that appear on the blog and homepage."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/blogs">
              <ArrowLeft className="h-4 w-4" />
              Back to list
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  {...register("title")}
                  disabled={readOnly}
                  placeholder="Best Time to Visit Ladakh"
                />
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
                <Label htmlFor="status">Status</Label>
                <Select id="status" {...register("status")} disabled={readOnly}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  disabled={readOnly}
                  rows={3}
                  placeholder="Short summary shown in listings and SEO..."
                />
                {errors.excerpt && (
                  <p className="text-sm text-destructive">{errors.excerpt.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <RepeaterField
                      label="Content paragraphs"
                      items={paragraphsToItems(field.value ?? [])}
                      onChange={(items) => field.onChange(itemsToParagraphs(items))}
                      disabled={readOnly}
                      placeholder="Write a paragraph..."
                    />
                  )}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">
                    {typeof errors.content.message === "string"
                      ? errors.content.message
                      : "Add at least one content paragraph"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Featured image</Label>
                <Controller
                  control={control}
                  name="imageId"
                  render={({ field }) => (
                    <MediaPicker
                      value={field.value}
                      onChange={(media) => field.onChange(media?.id ?? null)}
                      disabled={readOnly}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category")}
                  disabled={readOnly}
                  placeholder="Ladakh"
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  {...register("author")}
                  disabled={readOnly}
                  placeholder="Priya Sharma"
                />
                {errors.author && (
                  <p className="text-sm text-destructive">{errors.author.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorRole">Author role</Label>
                <Input
                  id="authorRole"
                  {...register("authorRole")}
                  disabled={readOnly}
                  placeholder="Trip Curator"
                />
                {errors.authorRole && (
                  <p className="text-sm text-destructive">{errors.authorRole.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">Publish date</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  {...register("publishedAt")}
                  disabled={readOnly}
                />
                {errors.publishedAt && (
                  <p className="text-sm text-destructive">{errors.publishedAt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="readTime">Read time (minutes)</Label>
                <Input
                  id="readTime"
                  type="number"
                  min={1}
                  max={120}
                  {...register("readTime", {
                    setValueAs: (value) =>
                      value === "" || value === null || value === undefined
                        ? undefined
                        : Number(value),
                  })}
                  disabled={readOnly}
                  placeholder="Auto-calculated if empty"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagsString}
                  disabled={readOnly}
                  placeholder="Ladakh, Planning, Tips"
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setValue("tags", tags, { shouldDirty: true });
                  }}
                />
                <p className="text-xs text-muted-foreground">Comma-separated tags</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/blogs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create post"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
