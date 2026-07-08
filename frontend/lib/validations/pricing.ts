import { z } from "zod";

export const tripPricingSchema = z.object({
  basePrice: z.number().min(0),
  salePrice: z.number().nullable().optional(),
  showStrikeThrough: z.boolean(),
  offerLabel: z.string().optional(),
  offerValidUntil: z.string().nullable().optional(),
  currency: z.literal("INR"),
  pricePer: z.enum(["person", "bike", "couple"]),
});

export type TripPricingFormValues = z.infer<typeof tripPricingSchema>;

export const tripPricingUpdateSchema = z.object({
  pricing: tripPricingSchema,
});

export type TripPricingUpdateValues = z.infer<typeof tripPricingUpdateSchema>;
