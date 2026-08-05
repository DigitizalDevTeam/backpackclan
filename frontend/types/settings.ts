export interface GeneralSettings {
  siteName: string;
  tagline: string;
  logoId: string | null;
  faviconId: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  linkedin: string;
}

export type FontPreset = "default" | "modern" | "classic";

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  fontPreset: FontPreset;
}

export interface FooterSettings {
  copyright: string;
  description: string;
  showPaymentIcons: boolean;
}

export interface IntegrationSettings {
  whatsappWidget: boolean;
  tawkToEnabled: boolean;
  tawkToId: string;
  gtmId: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

export interface MailSettings {
  mailer: "smtp" | "log" | "sendmail" | "array";
  host: string;
  port: number;
  username: string;
  password: string;
  passwordSet?: boolean;
  encryption: "tls" | "ssl" | "null" | "";
  fromAddress: string;
  fromName: string;
}

export interface PaymentSettings {
  stripeEnabled: boolean;
  stripeKey: string;
  stripeSecret: string;
  stripeSecretSet?: boolean;
  stripeWebhookSecret: string;
  stripeWebhookSecretSet?: boolean;
  stripeCurrency: string;
  depositPercent: number;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
  razorpayKeySecretSet?: boolean;
  razorpayWebhookSecret: string;
  razorpayWebhookSecretSet?: boolean;
  razorpayCurrency: string;
  cashfreeEnabled: boolean;
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  cashfreeSecretKeySet?: boolean;
  cashfreeWebhookSecret: string;
  cashfreeWebhookSecretSet?: boolean;
  cashfreeCurrency: string;
  cashfreeEnv: "sandbox" | "production";
}

export interface NotificationSettings {
  bookingCreated: boolean;
  paymentReceived: boolean;
  attachInvoice: boolean;
  leadConfirmation: boolean;
  leadOpsNotify: boolean;
}

export interface SiteSettings {
  general: GeneralSettings;
  social: SocialSettings;
  branding: BrandingSettings;
  footer: FooterSettings;
  integrations: IntegrationSettings;
  maintenance: MaintenanceSettings;
  mail: MailSettings;
  payments: PaymentSettings;
  notifications: NotificationSettings;
  updatedAt: string;
}

/** Public layout may omit admin-only groups. */
export type PublicSiteSettings = Pick<
  SiteSettings,
  "general" | "social" | "branding" | "footer" | "integrations" | "maintenance"
> & { updatedAt: string };

export type SettingsGroup = keyof Omit<SiteSettings, "updatedAt">;

export const SETTINGS_TABS: { id: SettingsGroup; label: string }[] = [
  { id: "general", label: "General" },
  { id: "social", label: "Social" },
  { id: "branding", label: "Branding" },
  { id: "footer", label: "Footer" },
  { id: "mail", label: "Email / SMTP" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "maintenance", label: "Maintenance" },
];
