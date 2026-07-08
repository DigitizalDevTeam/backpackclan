"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { MediaPicker } from "@/components/forms/MediaPicker";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { SlugField } from "@/components/forms/travel/SlugField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { categoryFormSchema, type CategoryFormValues } from "@/lib/validations/category";
import { hasPermission } from "@/lib/auth/permissions";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { AuthUser } from "@/types/auth";
import type { Category } from "@/types/category";

interface CategoryFormProps {
  categoryId?: string;
  user: AuthUser;
}

export function CategoryForm({ categoryId, user }: CategoryFormProps) {
  const router = useRouter();
  const isEdit = !!categoryId;
  const canWrite = hasPermission(
    user,
    isEdit ? "categories.update" : "categories.create"
  );
  const readOnly = !canWrite;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormValues>,
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      imageId: null,
      description: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const name = watch("name");

  useUnsavedChanges(isDirty && !readOnly);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const result = await res.json();
        if (result.success) setAllCategories(result.data);
      } catch {
        // non-blocking
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categoryId) return;

    async function load() {
      try {
        const res = await fetch(`/api/admin/categories/${categoryId}`);
        const result = await res.json();
        if (!result.success) {
          toast.error("Category not found");
          router.push("/admin/categories");
          return;
        }
        const c = result.data;
        reset({
          name: c.name,
          slug: c.slug,
          parentId: c.parentId,
          imageId: c.imageId,
          description: c.description,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
        });
      } catch {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoryId, reset, router]);

  const parentOptions = useMemo(
    () => allCategories.filter((c) => c.id !== categoryId),
    [allCategories, categoryId]
  );

  async function onSubmit(data: CategoryFormValues) {
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/admin/categories/${categoryId}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        toast.error(result.errors?.form ?? "Failed to save category");
        return;
      }

      toast.success(isEdit ? "Category updated" : "Category created");
      router.push("/admin/categories");
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSkeleton variant="form" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Category" : "New Category"}
        description="Organize trips with categories and optional parent hierarchy."
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                disabled={readOnly}
                placeholder="Bike Tours"
              />
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

            <div className="space-y-2">
              <Label htmlFor="parentId">Parent category</Label>
              <Controller
                control={control}
                name="parentId"
                render={({ field }) => (
                  <Select
                    id="parentId"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || null)
                    }
                    disabled={readOnly}
                  >
                    <option value="">None (top-level)</option>
                    {parentOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
            </div>

            <Controller
              control={control}
              name="imageId"
              render={({ field }) => (
                <MediaPicker
                  value={field.value}
                  onChange={(media) => field.onChange(media?.id ?? null)}
                  accept="image"
                  label="Category image"
                  disabled={readOnly}
                />
              )}
            />

            <div className="space-y-2">
              <Label>Description</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={readOnly}
                    placeholder="Describe this category..."
                  />
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  {...register("sortOrder")}
                  disabled={readOnly}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-destructive">
                    {errors.sortOrder.message}
                  </p>
                )}
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    disabled={readOnly}
                    className="rounded border-input"
                  />
                  Active
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/categories">Cancel</Link>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
