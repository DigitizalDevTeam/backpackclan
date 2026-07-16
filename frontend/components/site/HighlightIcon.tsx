import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_ICON_MAP } from "@/lib/icons/highlight-icons";

interface HighlightIconProps {
  icon?: string;
  className?: string;
}

export function HighlightIcon({ icon, className }: HighlightIconProps) {
  const iconClass = cn("shrink-0 text-primary", className);

  if (!icon) {
    return <MapPin className={iconClass} aria-hidden="true" />;
  }

  const LucideIcon = HIGHLIGHT_ICON_MAP[icon];
  if (LucideIcon) {
    return <LucideIcon className={iconClass} aria-hidden="true" />;
  }

  return (
    <span className={cn("text-lg leading-none", className)} aria-hidden="true">
      {icon}
    </span>
  );
}
