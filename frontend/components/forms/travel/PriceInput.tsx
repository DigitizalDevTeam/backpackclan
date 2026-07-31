"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PriceDisplay } from "@/components/forms/travel/PriceDisplay";
import {
  defaultDynamicPricing,
  normalizeDynamicPricing,
  RIDER_OPTION_KEYS,
  RIDER_OPTION_LABELS,
  ROOM_OPTION_KEYS,
  ROOM_OPTION_LABELS,
} from "@/lib/pricing/dynamic-options";
import { formatInr, isSaleActive, parseInrInput } from "@/lib/pricing/utils";
import type { DynamicPricingConfig, TripPricing } from "@/types/travel";

interface PriceInputProps {
  pricing: TripPricing;
  onChange: (pricing: TripPricing) => void;
  disabled?: boolean;
}

export function PriceInput({ pricing, onChange, disabled = false }: PriceInputProps) {
  const dynamic = normalizeDynamicPricing(
    pricing.dynamicPricing ?? defaultDynamicPricing(pricing.basePrice),
    pricing.basePrice
  );

  function update(patch: Partial<TripPricing>) {
    onChange({ ...pricing, ...patch });
  }

  function updateDynamic(patch: Partial<DynamicPricingConfig>) {
    const next = { ...dynamic, ...patch };
    update({ dynamicPricing: next });
  }

  function setMatrixPrice(
    rider: "solo" | "dual",
    room: "triple" | "double" | "single",
    value: string
  ) {
    const parsed = parseInrInput(value);
    updateDynamic({
      matrix: {
        ...dynamic.matrix,
        [rider]: {
          ...dynamic.matrix[rider],
          [room]: parsed || null,
        },
      },
      riders: {
        ...dynamic.riders,
        [rider]:
          room === "triple"
            ? parsed || dynamic.riders[rider]
            : dynamic.riders[rider],
      },
      rooms: {
        ...dynamic.rooms,
        [room]:
          rider === "solo" ? parsed || dynamic.rooms[room] : dynamic.rooms[room],
      },
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Base / starting price (INR)</Label>
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

      <div className="space-y-3 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={dynamic.enabled}
            onChange={(e) =>
              updateDynamic({
                ...(e.target.checked && !pricing.dynamicPricing
                  ? defaultDynamicPricing(pricing.basePrice)
                  : {}),
                enabled: e.target.checked,
              })
            }
            disabled={disabled}
            className="rounded border-input"
          />
          Enable dynamic pricing (Solo / Dual + Room sharing)
        </label>
        <p className="text-xs text-muted-foreground">
          Trip page pe user options select karega aur price auto update hogi. Listing pe
          sabse kam package price &quot;starting from&quot; dikhegi.
        </p>

        {dynamic.enabled ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dynamic.riderEnabled}
                  onChange={(e) => updateDynamic({ riderEnabled: e.target.checked })}
                  disabled={disabled}
                  className="rounded border-input"
                />
                Solo / Dual Rider
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={dynamic.roomEnabled}
                  onChange={(e) => updateDynamic({ roomEnabled: e.target.checked })}
                  disabled={disabled}
                  className="rounded border-input"
                />
                Room sharing (Triple / Double / Single)
              </label>
            </div>

            {dynamic.riderEnabled && dynamic.roomEnabled ? (
              <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="px-3 py-2 font-medium">Package</th>
                      {ROOM_OPTION_KEYS.map((room) => (
                        <th key={room} className="px-3 py-2 font-medium">
                          {ROOM_OPTION_LABELS[room]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RIDER_OPTION_KEYS.map((rider) => (
                      <tr key={rider} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">
                          {RIDER_OPTION_LABELS[rider]}
                        </td>
                        {ROOM_OPTION_KEYS.map((room) => {
                          const value = dynamic.matrix[rider][room];
                          return (
                            <td key={room} className="px-3 py-2">
                              <Input
                                value={value ? formatInr(value) : ""}
                                onChange={(e) =>
                                  setMatrixPrice(rider, room, e.target.value)
                                }
                                disabled={disabled}
                                placeholder="—"
                                className="h-9"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {dynamic.riderEnabled && !dynamic.roomEnabled ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {RIDER_OPTION_KEYS.map((rider) => (
                  <div key={rider} className="space-y-1.5">
                    <Label>{RIDER_OPTION_LABELS[rider]}</Label>
                    <Input
                      value={
                        dynamic.riders[rider] ? formatInr(dynamic.riders[rider]!) : ""
                      }
                      onChange={(e) => {
                        const parsed = parseInrInput(e.target.value);
                        updateDynamic({
                          riders: {
                            ...dynamic.riders,
                            [rider]: parsed || null,
                          },
                        });
                      }}
                      disabled={disabled}
                      placeholder="₹0"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {!dynamic.riderEnabled && dynamic.roomEnabled ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {ROOM_OPTION_KEYS.map((room) => (
                  <div key={room} className="space-y-1.5">
                    <Label>{ROOM_OPTION_LABELS[room]}</Label>
                    <Input
                      value={
                        dynamic.rooms[room] ? formatInr(dynamic.rooms[room]!) : ""
                      }
                      onChange={(e) => {
                        const parsed = parseInrInput(e.target.value);
                        updateDynamic({
                          rooms: {
                            ...dynamic.rooms,
                            [room]: parsed || null,
                          },
                        });
                      }}
                      disabled={disabled}
                      placeholder="₹0"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-2 text-xs text-muted-foreground">Price preview</p>
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
