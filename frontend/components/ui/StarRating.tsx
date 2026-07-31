import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  max?: number;
  className?: string;
  starClassName?: string;
}

/** Renders 1–5 stars with partial fill for decimal ratings (e.g. 4.8). */
export function StarRating({
  rating,
  max = 5,
  className,
  starClassName = "h-4 w-4",
}: StarRatingProps) {
  const value = Math.max(0, Math.min(max, Number.isFinite(rating) ? rating : 0));

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: max }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className={cn("relative inline-flex", starClassName)}>
            <Star
              className={cn(starClassName, "fill-slate-200 text-slate-200")}
              aria-hidden
            />
            {fill > 0 ? (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className={cn(starClassName, "fill-amber-400 text-amber-400")}
                  aria-hidden
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
