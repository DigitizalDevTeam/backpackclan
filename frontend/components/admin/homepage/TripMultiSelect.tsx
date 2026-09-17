"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, ChevronsUpDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type TripOption = {
  id: string;
  title: string;
  slug: string;
  destination?: string;
  status?: string;
};

interface TripMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
  trips?: TripOption[];
  disabled?: boolean;
  label?: string;
  hint?: string;
  reorderable?: boolean;
}

export function TripMultiSelect({
  value,
  onChange,
  trips: externalTrips,
  disabled = false,
  label = "Trips",
  hint = "Select one or more published trips.",
  reorderable = true,
}: TripMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState<TripOption[]>([]);

  useEffect(() => {
    if (externalTrips) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/trips");
        const result = await res.json();
        if (!cancelled && result.success) {
          setLoaded(
            (result.data as TripOption[]).filter((trip) => trip.status === "published")
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
  }, [externalTrips]);

  const trips = externalTrips ?? loaded;
  const selected = value ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter(
      (trip) =>
        trip.title.toLowerCase().includes(q) ||
        trip.slug.toLowerCase().includes(q) ||
        (trip.destination ?? "").toLowerCase().includes(q)
    );
  }, [trips, search]);

  const selectedTrips = selected
    .map((id) => trips.find((trip) => trip.id === id))
    .filter((trip): trip is TripOption => trip != null);

  function toggle(id: string) {
    if (disabled) return;
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    );
  }

  function remove(id: string) {
    if (disabled) return;
    onChange(selected.filter((x) => x !== id));
  }

  function move(id: string, direction: -1 | 1) {
    if (disabled) return;
    const index = selected.indexOf(id);
    if (index < 0) return;
    const next = index + direction;
    if (next < 0 || next >= selected.length) return;
    const copy = [...selected];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item!);
    onChange(copy);
  }

  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}

      {selectedTrips.length > 0 ? (
        <div className={cn("flex flex-wrap gap-2", reorderable && "flex-col")}>
          {selectedTrips.map((trip, index) => (
            <span
              key={trip.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800",
                reorderable && "w-full justify-between rounded-lg px-3 py-2"
              )}
            >
              <span className="min-w-0 truncate">
                {reorderable ? `${index + 1}. ` : ""}
                {trip.title}
              </span>
              <span className="inline-flex shrink-0 items-center gap-0.5">
                {reorderable && !disabled ? (
                  <>
                    <button
                      type="button"
                      onClick={() => move(trip.id, -1)}
                      disabled={index === 0}
                      className="rounded p-0.5 hover:bg-emerald-100 disabled:opacity-30"
                      aria-label={`Move ${trip.title} up`}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(trip.id, 1)}
                      disabled={index === selectedTrips.length - 1}
                      className="rounded p-0.5 hover:bg-emerald-100 disabled:opacity-30"
                      aria-label={`Move ${trip.title} down`}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : null}
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => remove(trip.id)}
                    className="rounded-full p-0.5 hover:bg-emerald-100"
                    aria-label={`Remove ${trip.title}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </span>
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
              ? `${selected.length} trip${selected.length === 1 ? "" : "s"} selected`
              : "Select trips…"}
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
                  placeholder="Search trips…"
                  className="h-9 pl-8"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No published trips found.
                </p>
              ) : (
                filtered.map((trip) => {
                  const isSelected = selected.includes(trip.id);
                  return (
                    <button
                      key={trip.id}
                      type="button"
                      onClick={() => toggle(trip.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-emerald-50",
                        isSelected && "bg-emerald-50/80"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300"
                        )}
                      >
                        {isSelected ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{trip.title}</span>
                        {trip.destination ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {trip.destination}
                          </span>
                        ) : null}
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
                className="font-medium text-emerald-700 hover:underline"
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
