import { z } from "zod";

export const generalSettingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  tagline: z.string(),
  logoId: z.string().nullable(),
  faviconId: z.string().nullable(),
  contactEmail: z
    .string()
    .min(1, "Contact email is required")
    .email("Please enter a valid email"),
  contactPhone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^[+\d\s()-]{7,20}$/, "Please enter a valid phone number"),
  address: z.string(),
});

export const socialSettingsSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  youtube: z.string(),
  whatsapp: z.string(),
  linkedin: z.string(),
});

export const brandingSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  fontPreset: z.enum(["default", "modern", "classic"]),
});

export const footerSettingsSchema = z.object({
  copyright: z.string().min(1, "Copyright text is required"),
  description: z.string(),
  showPaymentIcons: z.boolean(),
});

export const integrationSettingsSchema = z.object({
  whatsappWidget: z.boolean(),
  tawkToEnabled: z.boolean(),
  tawkToId: z.string(),
  gtmId: z.string(),
});

export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean(),
  message: z.string().min(1, "Maintenance message is required when enabled").or(z.literal("")),
});
