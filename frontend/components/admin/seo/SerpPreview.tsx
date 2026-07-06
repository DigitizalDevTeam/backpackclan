import { cn } from "@/lib/utils";

interface SerpPreviewProps {
  title: string;
  description: string;
  url: string;
  className?: string;
}

export function SerpPreview({
  title,
  description,
  url,
  className,
}: SerpPreviewProps) {
  const displayUrl = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <div className={cn("rounded-xl border bg-card p-5", className)}>
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Google Search Preview
      </p>
      <div className="max-w-xl space-y-1">
        <p className="truncate text-xl text-[#1a0dab] hover:underline cursor-default leading-snug">
          {title || "Page Title"}
        </p>
        <p className="text-sm text-[#006621] truncate">{displayUrl || "backpackclan.com"}</p>
        <p className="text-sm text-[#545454] line-clamp-2 leading-relaxed">
          {description ||
            "Your meta description will appear here. Write a compelling summary to improve click-through rates."}
        </p>
      </div>
    </div>
  );
}
