import { cn } from "@/lib/utils";
import { formatInr, PRICE_PER_LABELS, resolvePricing } from "@/lib/pricing/utils";
import type { ResolvedPricing } from "@/types/pricing";
import type { TripPricing } from "@/types/travel";

interface PriceDisplayProps {
  pricing: TripPricing;
  override?: TripPricing | null;
  resolved?: ResolvedPricing;
  size?: "sm" | "md" | "lg";
  showPricePer?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { price: "text-lg font-bold", base: "text-sm", badge: "text-[10px] px-2 py-0" },
  md: { price: "text-2xl font-bold", base: "text-lg", badge: "text-xs px-2.5 py-0.5" },
  lg: { price: "text-3xl font-bold", base: "text-xl", badge: "text-sm px-3 py-1" },
};

export function PriceDisplay({
  pricing,
  override,
  resolved: resolvedProp,
  size = "md",
  showPricePer = false,
  className,
}: PriceDisplayProps) {
  const resolved = resolvedProp ?? resolvePricing(pricing, override);
  const classes = sizeClasses[size];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {resolved.offerActive ? (
        <>
          <span className={cn(classes.price, "text-primary")}>
            {formatInr(resolved.displayPrice)}
          </span>
          {resolved.showStrikeThrough && (
            <span className={cn(classes.base, "text-muted-foreground line-through")}>
              {formatInr(resolved.basePrice)}
            </span>
          )}
          {resolved.offerLabel && (
            <span
              className={cn(
                "rounded-full bg-amber-100 font-medium text-amber-800",
                classes.badge
              )}
            >
              {resolved.offerLabel}
            </span>
          )}
        </>
      ) : (
        <span className={classes.price}>{formatInr(resolved.displayPrice)}</span>
      )}
      {showPricePer && (
        <span className="text-sm text-muted-foreground">
          {PRICE_PER_LABELS[resolved.pricePer]}
        </span>
      )}
    </div>
  );
}
