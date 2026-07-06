import { z } from "zod";

const robotsEnum = z.enum([
  "index, follow",
  "noindex, follow",
  "index, nofollow",
  "noindex, nofollow",
]);

export const seoFormSchema = z.object({
  metaTitle: z.string().min(1, "Meta title is required").max(70, "Title is too long"),
  metaDescription: z
    .string()
    .min(1, "Meta description is required")
    .max(200, "Description is too long"),
  ogImageId: z.string().nullable(),
  canonicalUrl: z
    .string()
    .min(1, "Canonical URL is required")
    .url("Please enter a valid URL"),
  robots: robotsEnum,
  schemaJson: z.string(),
});

export type SeoFormValues = z.infer<typeof seoFormSchema>;
