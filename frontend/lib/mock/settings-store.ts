import type { SiteSettings, SettingsGroup } from "@/types/settings";
import { logActivity } from "@/lib/mock/activity-store";
import { createPersistedStore } from "@/lib/mock/persisted-store";

const DEFAULT_SETTINGS: SiteSettings = {
  general: {
    siteName: "Backpackclan",
    tagline: "Adventure Tours in the Himalayas",
    logoId: null,
    faviconId: null,
    contactEmail: "hello@backpackclan.com",
    contactPhone: "+91 98765 43210",
    address: "Mumbai, Maharashtra, India",
  },
  social: {
    facebook: "https://facebook.com/backpackclan",
    instagram: "https://instagram.com/backpackclan",
    youtube: "https://youtube.com/@backpackclan",
    whatsapp: "+919876543210",
    linkedin: "https://linkedin.com/company/backpackclan",
  },
  branding: {
    primaryColor: "#F58220",
    secondaryColor: "#FFD200",
    fontPreset: "default",
  },
  footer: {
    copyright: "© 2026 Backpackclan. All rights reserved.",
    description:
      "Curated bike tours, treks, and group adventures across Leh Ladakh, Spiti, Kashmir, Bhutan & Nepal.",
    showPaymentIcons: true,
  },
  integrations: {
    whatsappWidget: false,
    tawkToEnabled: false,
    tawkToId: "",
    gtmId: "",
  },
  maintenance: {
    enabled: false,
    message:
      "We're currently performing scheduled maintenance. Please check back soon!",
  },
  mail: {
    mailer: "smtp",
    host: "",
    port: 587,
    username: "",
    password: "",
    encryption: "tls",
    fromAddress: "hello@backpackclan.com",
    fromName: "Backpackclan",
  },
  payments: {
    stripeEnabled: false,
    stripeKey: "",
    stripeSecret: "",
    stripeWebhookSecret: "",
    stripeCurrency: "inr",
    depositPercent: 30,
    razorpayEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayWebhookSecret: "",
    razorpayCurrency: "INR",
  },
  notifications: {
    bookingCreated: true,
    paymentReceived: true,
    attachInvoice: true,
    leadConfirmation: true,
    leadOpsNotify: true,
  },
  updatedAt: new Date().toISOString(),
};

const settingsStore = createPersistedStore("settings", DEFAULT_SETTINGS);

export function getSettings(): SiteSettings {
  return structuredClone(settingsStore.get());
}

export function getSettingsGroup<G extends SettingsGroup>(group: G): SiteSettings[G] {
  return structuredClone(settingsStore.get()[group]);
}

export function updateSettingsGroup<G extends SettingsGroup>(
  group: G,
  data: SiteSettings[G]
): SiteSettings {
  settingsStore.replace((current) => ({
    ...current,
    [group]: data,
    updatedAt: new Date().toISOString(),
  }));
  logActivity(`Global settings — ${group} updated`, "settings");
  return getSettings();
}

export function isMaintenanceMode(): boolean {
  return settingsStore.get().maintenance.enabled;
}
