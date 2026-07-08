import type { CSSProperties } from "react";
import type { BrandingSettings, FontPreset } from "@/types/settings";

export function getFontClassName(preset: FontPreset): string {
  switch (preset) {
    case "modern":
      return "font-[family-name:var(--font-geist-sans)] tracking-tight";
    case "classic":
      return "font-serif";
    default:
      return "";
  }
}

export function getBrandingStyle(branding: BrandingSettings): CSSProperties {
  return {
    ["--primary" as string]: branding.primaryColor,
    ["--ring" as string]: branding.primaryColor,
    ["--sidebar-active" as string]: branding.primaryColor,
    ["--brand-secondary" as string]: branding.secondaryColor,
  } as CSSProperties;
}

export function hexToRgb(hex: string): string | null {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}
