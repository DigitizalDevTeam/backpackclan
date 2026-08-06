import { z } from "zod";
import { isValidGtmId, sanitizeGtmId, sanitizeTawkToId } from "@/lib/site/integrations";

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

/** Zod 4 rejects null for z.string(); API/settings often send null for empty keys. */
const str = z.preprocess((v) => (v == null ? "" : String(v)), z.string());
const bool = z.preprocess((v) => v === true || v === "true" || v === 1 || v === "1", z.boolean());

export const integrationSettingsSchema = z
  .object({
    whatsappWidget: bool,
    tawkToEnabled: bool,
    tawkToId: str,
    gtmId: str,
  })
  .superRefine((data, ctx) => {
    const gtm = data.gtmId.trim();
    if (gtm && !isValidGtmId(gtm)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gtmId"],
        message: "Use a valid GTM container ID (e.g. GTM-XXXXXXX)",
      });
    }

    if (data.tawkToEnabled && !data.tawkToId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tawkToId"],
        message: "Tawk.to Property/Widget ID is required when live chat is enabled",
      });
    }
  })
  .transform((data) => ({
    ...data,
    gtmId: sanitizeGtmId(data.gtmId) ?? "",
    tawkToId: sanitizeTawkToId(data.tawkToId) ?? "",
  }));

export const maintenanceSettingsSchema = z.object({
  enabled: z.boolean(),
  message: z.string().min(1, "Maintenance message is required when enabled").or(z.literal("")),
});

export const mailSettingsSchema = z.object({
  mailer: z.enum(["smtp", "log", "sendmail", "array"]),
  host: z.string(),
  port: z.coerce.number().int().min(1).max(65535),
  username: z.string(),
  password: z.string(),
  passwordSet: z.boolean().optional(),
  encryption: z.enum(["tls", "ssl", "null", ""]),
  fromAddress: z.string().email("Valid from address required"),
  fromName: z.string().min(1, "From name is required"),
});

export const paymentSettingsSchema = z.object({
  stripeEnabled: bool,
  stripeKey: str,
  stripeSecret: str,
  stripeSecretSet: z.boolean().optional(),
  stripeWebhookSecret: str,
  stripeWebhookSecretSet: z.boolean().optional(),
  stripeCurrency: z.preprocess((v) => (v == null || v === "" ? "inr" : String(v)), z.string().min(1)),
  depositPercent: z.coerce.number().int().min(1).max(100),
  razorpayEnabled: bool,
  razorpayKeyId: str,
  razorpayKeySecret: str,
  razorpayKeySecretSet: z.boolean().optional(),
  razorpayWebhookSecret: str,
  razorpayWebhookSecretSet: z.boolean().optional(),
  razorpayCurrency: z.preprocess((v) => (v == null || v === "" ? "INR" : String(v)), z.string().min(1)),
  cashfreeEnabled: bool,
  cashfreeAppId: str,
  cashfreeSecretKey: str,
  cashfreeSecretKeySet: z.boolean().optional(),
  cashfreeWebhookSecret: str,
  cashfreeWebhookSecretSet: z.boolean().optional(),
  cashfreeCurrency: z.preprocess((v) => (v == null || v === "" ? "INR" : String(v)), z.string().min(1)),
  cashfreeEnv: z.preprocess(
    (v) => (v === "production" ? "production" : "sandbox"),
    z.enum(["sandbox", "production"])
  ),
});

export const notificationSettingsSchema = z.object({
  bookingCreated: z.boolean(),
  paymentReceived: z.boolean(),
  attachInvoice: z.boolean(),
  leadConfirmation: z.boolean(),
  leadOpsNotify: z.boolean(),
});
