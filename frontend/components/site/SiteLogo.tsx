import Link from "next/link";
import { Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteLogoProps {
  siteName: string;
  tagline?: string;
  logoId?: string | null;
  mediaMap?: Record<string, string>;
  showTagline?: boolean;
  className?: string;
  imageClassName?: string;
}

export function SiteLogo({
  siteName,
  tagline,
  logoId,
  mediaMap = {},
  showTagline = true,
  className,
  imageClassName = "h-9 w-9",
}: SiteLogoProps) {
  const logoUrl = logoId ? mediaMap[logoId] : null;

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2", className)}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={siteName}
          className={cn("rounded-lg object-contain", imageClassName)}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg bg-primary",
            imageClassName
          )}
        >
          <Mountain className="h-5 w-5 text-white" />
        </div>
      )}
      <div className="leading-tight text-left">
        <span className="block font-bold text-foreground">{siteName}</span>
        {showTagline && tagline ? (
          <span className="hidden text-[10px] text-muted-foreground sm:block">{tagline}</span>
        ) : null}
      </div>
    </Link>
  );
}
