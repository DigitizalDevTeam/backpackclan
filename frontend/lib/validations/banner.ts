import { z } from "zod";

const placementEnum = z.enum([
  "homepage_hero",
  "homepage_secondary",
  "destination_page",
  "custom",
]);

const mediaTypeEnum = z.enum(["image", "video"]);
const ctaStyleEnum = z.enum(["primary", "secondary", "outline"]);

const ctaButtonSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "CTA label is required"),
  url: z.string().min(1, "CTA URL is required"),
  style: ctaStyleEnum,
});

export const bannerFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    placement: placementEnum,
    mediaType: mediaTypeEnum,
    mediaId: z.string().nullable(),
    headline: z.string().min(1, "Headline is required"),
    subheadline: z.string(),
    linkUrl: z.string(),
    ctaButtons: z.array(ctaButtonSchema),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
    sortOrder: z.coerce.number().min(0),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.startsAt || !data.endsAt) return true;
      return new Date(data.endsAt) > new Date(data.startsAt);
    },
    {
      message: "End date must be after start date",
      path: ["endsAt"],
    }
  )
  .refine((data) => !!data.mediaId, {
    message: "Please select a media file",
    path: ["mediaId"],
  });

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
