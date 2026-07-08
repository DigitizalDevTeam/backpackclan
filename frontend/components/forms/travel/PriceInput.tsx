"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import { formatInr, isSaleActive, parseInrInput } from "@/lib/pricing/utils";
import type { TripPricing } from "@/types/travel";

interface PriceInputProps {
  pricing: TripPricing;
  onChange: (pricing: TripPricing) => void;
  disabled?: boolean;
}

export function PriceInput({ pricing, onChange, disabled = false }: PriceInputProps) {
  function update(patch: Partial<TripPricing>) {
    onChange({ ...pricing, ...patch });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Base price (INR)</Label>
          <Input
            id="basePrice"
            value={pricing.basePrice ? formatInr(pricing.basePrice) : ""}
            onChange={(e) => update({ basePrice: parseInrInput(e.target.value) })}
            disabled={disabled}
            placeholder="₹52,999"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">Sale price (INR)</Label>
          <Input
            id="salePrice"
            value={pricing.salePrice ? formatInr(pricing.salePrice) : ""}
            onChange={(e) => {
              const parsed = parseInrInput(e.target.value);
              update({ salePrice: parsed || null });
            }}
            disabled={disabled}
            placeholder="₹45,999"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="offerLabel">Offer label</Label>
          <Input
            id="offerLabel"
            value={pricing.offerLabel ?? ""}
            onChange={(e) => update({ offerLabel: e.target.value })}
            disabled={disabled}
            placeholder="Early Bird 15% Off"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="offerValidUntil">Offer valid until</Label>
          <Input
            id="offerValidUntil"
            type="date"
            value={pricing.offerValidUntil?.slice(0, 10) ?? ""}
            onChange={(e) =>
              update({
                offerValidUntil: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : null,
              })
            }
            disabled={disabled}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={pricing.showStrikeThrough}
          onChange={(e) => update({ showStrikeThrough: e.target.checked })}
          disabled={disabled}
          className="rounded border-input"
        />
        Show strike-through on base price when sale is active
      </label>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground mb-2">Price preview</p>
        <PriceDisplay pricing={pricing} />
        {pricing.offerValidUntil && !isSaleActive(pricing) && (
          <p className="mt-2 text-xs text-muted-foreground">
            Offer expired — showing base price
          </p>
        )}
      </div>
    </div>
  );
}
