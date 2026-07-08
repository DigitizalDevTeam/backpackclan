import { Mountain, Wrench } from "lucide-react";
import type { SiteSettings } from "@/types/settings";
import { SiteLogo } from "@/components/site/SiteLogo";

interface MaintenanceScreenProps {
  settings: SiteSettings;
  mediaMap: Record<string, string>;
}

export function MaintenanceScreen({ settings, mediaMap }: MaintenanceScreenProps) {
  const { general, maintenance } = settings;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 text-center">
      <SiteLogo
        siteName={general.siteName}
        tagline={general.tagline}
        logoId={general.logoId}
        mediaMap={mediaMap}
        className="mb-8 justify-center"
      />
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wrench className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">We&apos;ll be back soon</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {maintenance.message}
        </p>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mountain className="h-4 w-4" />
          {general.siteName}
        </p>
      </div>
    </div>
  );
}
