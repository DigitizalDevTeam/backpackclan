import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  parentId: z.string().nullable(),
  imageId: z.string().nullable(),
  description: z.string(),
  sortOrder: z.coerce.number().min(0),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
