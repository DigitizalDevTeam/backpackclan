import { z } from "zod";

const roomPricesSchema = z.object({
  triple: z.number().nullable(),
  double: z.number().nullable(),
  single: z.number().nullable(),
});

export const dynamicPricingSchema = z.object({
  enabled: z.boolean(),
  riderEnabled: z.boolean(),
  roomEnabled: z.boolean(),
  riders: z.object({
    solo: z.number().nullable(),
    dual: z.number().nullable(),
  }),
  rooms: roomPricesSchema,
  matrix: z.object({
    solo: roomPricesSchema,
    dual: roomPricesSchema,
  }),
});

export const tripPricingSchema = z.object({
  basePrice: z.number().min(0),
  salePrice: z.number().nullable().optional(),
  showStrikeThrough: z.boolean(),
  offerLabel: z.string().optional(),
  offerValidUntil: z.string().nullable().optional(),
  currency: z.literal("INR"),
  pricePer: z.enum(["person", "bike", "couple"]),
  dynamicPricing: dynamicPricingSchema.nullable().optional(),
});

export type TripPricingFormValues = z.infer<typeof tripPricingSchema>;

export const tripPricingUpdateSchema = z.object({
  pricing: tripPricingSchema,
});

export type TripPricingUpdateValues = z.infer<typeof tripPricingUpdateSchema>;
