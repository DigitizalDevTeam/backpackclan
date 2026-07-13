"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type DestinationOption = {
  id: string;
  name: string;
  slug: string;
  status?: string;
  country?: string;
};

interface DestinationMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  destinations?: DestinationOption[];
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function DestinationMultiSelect({
  value,
  onChange,
  destinations: externalDestinations,
  disabled = false,
  label = "Destinations",
  hint = "Select one or more published destinations.",
}: DestinationMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState<DestinationOption[]>([]);

  useEffect(() => {
    if (externalDestinations) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/destinations");
        const result = await res.json();
        if (!cancelled && result.success) {
          setLoaded(
            (result.data as DestinationOption[]).filter(
              (d) => d.status === "published"
            )
          );
        }
      } catch {
        // non-blocking
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [externalDestinations]);

  const destinations = externalDestinations ?? loaded;
  const selected = value ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        (d.country ?? "").toLowerCase().includes(q)
    );
  }, [destinations, search]);

  const selectedDestinations = destinations.filter((d) => selected.includes(d.id));

  function toggle(id: string) {
    if (disabled) return;
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  }

  function remove(id: string) {
    if (disabled) return;
    onChange(selected.filter((x) => x !== id));
  }

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}

      {selectedDestinations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedDestinations.map((dest) => (
            <span
              key={dest.id}
              className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-medium text-[#F58220]"
            >
              {dest.name}
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => remove(dest.id)}
                  className="rounded-full p-0.5 hover:bg-orange-100"
                  aria-label={`Remove ${dest.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className="h-auto min-h-10 w-full justify-between px-3 py-2 font-normal"
        >
          <span className="text-muted-foreground">
            {selected.length > 0
              ? `${selected.length} destination${selected.length === 1 ? "" : "s"} selected`
              : "Select destinations…"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {open && !disabled ? (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search destinations…"
                  className="h-9 pl-8"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No published destinations found.
                </p>
              ) : (
                filtered.map((dest) => {
                  const isSelected = selected.includes(dest.id);
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => toggle(dest.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-orange-50",
                        isSelected && "bg-orange-50/80"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-[#F58220] bg-[#F58220] text-white"
                            : "border-slate-300"
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{dest.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {dest.country ? `${dest.country} · ` : ""}
                          /{dest.slug}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
              <span>{selected.length} selected</span>
              <button
                type="button"
                className="font-medium text-[#F58220] hover:underline"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
