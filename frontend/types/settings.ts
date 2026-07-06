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

export interface SiteSettings {
  general: GeneralSettings;
  social: SocialSettings;
  branding: BrandingSettings;
  footer: FooterSettings;
  integrations: IntegrationSettings;
  maintenance: MaintenanceSettings;
  updatedAt: string;
}

export type SettingsGroup = keyof Omit<SiteSettings, "updatedAt">;

export const SETTINGS_TABS: { id: SettingsGroup; label: string }[] = [
  { id: "general", label: "General" },
  { id: "social", label: "Social" },
  { id: "branding", label: "Branding" },
  { id: "footer", label: "Footer" },
  { id: "integrations", label: "Integrations" },
  { id: "maintenance", label: "Maintenance" },
];
