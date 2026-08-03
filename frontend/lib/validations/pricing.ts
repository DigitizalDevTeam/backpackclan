import { z } from "zod";

const roomPricesSchema = z.object({
  single: z.number().nullable(),
  double: z.number().nullable(),
  triple: z.number().nullable(),
});

const travelPricesSchema = z.object({
  own_bike: z.number().nullable(),
  solo: z.number().nullable(),
  dual: z.number().nullable(),
  coach: z.number().nullable(),
});

export const dynamicPricingSchema = z.object({
  enabled: z.boolean(),
  travelEnabled: z.boolean(),
  roomEnabled: z.boolean(),
  travel: travelPricesSchema,
  rooms: roomPricesSchema,
  matrix: z.object({
    own_bike: roomPricesSchema,
    solo: roomPricesSchema,
    dual: roomPricesSchema,
    coach: roomPricesSchema,
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
