import type { BrandingSettings } from "@/types/settings";
import { getBrandingStyle, getFontClassName } from "@/lib/site/branding";

interface SiteBrandingStylesProps {
  branding: BrandingSettings;
  className?: string;
  children: React.ReactNode;
}

export function SiteBrandingStyles({
  branding,
  className = "",
  children,
}: SiteBrandingStylesProps) {
  const fontClass = getFontClassName(branding.fontPreset);

  return (
    <div className={`${fontClass} ${className}`.trim()} style={getBrandingStyle(branding)}>
      {children}
    </div>
  );
}
