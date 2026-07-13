import Link from "next/link";
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
  showTagline = false,
  className,
  imageClassName = "h-16 w-auto",
}: SiteLogoProps) {
  const logoUrl = logoId ? mediaMap[logoId] : "/logo.png";
  const isWordmark = !logoId || logoUrl === "/logo.png";

  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={siteName}
        className={cn("object-contain", imageClassName)}
      />
    </Link>
  );
}
