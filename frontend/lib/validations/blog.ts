import { z } from "zod";

export const blogFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  excerpt: z.string().min(1, "Excerpt is required").max(500),
  content: z.array(z.string().min(1)).min(1, "Add at least one content paragraph"),
  imageId: z.string().nullable(),
  category: z.string().min(1, "Category is required").max(100),
  author: z.string().min(1, "Author is required").max(100),
  authorRole: z.string().min(1, "Author role is required").max(100),
  publishedAt: z.string().min(1, "Publish date is required"),
  readTime: z.coerce.number().int().min(1).max(120).optional(),
  tags: z.array(z.string()),
  status: z.enum(["draft", "published"]),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
