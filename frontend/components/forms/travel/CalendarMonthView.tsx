"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeatStatusBadge } from "@/components/forms/travel/SeatStatusBadge";
import type { CalendarDeparture } from "@/types/travel";

interface CalendarMonthViewProps {
  departures: CalendarDeparture[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
  onDepartureClick?: (departure: CalendarDeparture) => void;
}

export function CalendarMonthView({
  departures,
  month: controlledMonth,
  onMonthChange,
  onDepartureClick,
}: CalendarMonthViewProps) {
  const [internalMonth, setInternalMonth] = useState(() => startOfMonth(new Date()));
  const currentMonth = controlledMonth ?? internalMonth;

  function setMonth(next: Date) {
    if (!controlledMonth) setInternalMonth(next);
    onMonthChange?.(next);
  }

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const departuresByDay = useMemo(() => {
    const map = new Map<string, CalendarDeparture[]>();
    for (const dep of departures) {
      const key = dep.startDate.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(dep);
      map.set(key, list);
    }
    return map;
  }, [departures]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h3>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div
            key={day}
            className="bg-muted/50 px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayDepartures = departuresByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={key}
              className={`min-h-24 bg-card p-1.5 ${
                inMonth ? "" : "bg-muted/20 text-muted-foreground"
              } ${isToday ? "ring-2 ring-inset ring-primary/30" : ""}`}
            >
              <div className="text-xs font-medium mb-1">{format(day, "d")}</div>
              <div className="space-y-1">
                {dayDepartures.slice(0, 2).map((dep) => (
                  <button
                    key={dep.id}
                    type="button"
                    onClick={() => onDepartureClick?.(dep)}
                    className="w-full rounded border bg-background p-1 text-left hover:bg-muted/50 transition-colors"
                  >
                    <p className="text-[10px] font-medium truncate">
                      {dep.tripTitle}
                    </p>
                    <SeatStatusBadge
                      status={dep.status ?? "available"}
                      className="mt-0.5 text-[9px] px-1 py-0"
                    />
                  </button>
                ))}
                {dayDepartures.length > 2 && (
                  <p className="text-[10px] text-muted-foreground px-1">
                    +{dayDepartures.length - 2} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Helper to format departure date for calendar grouping. */
export function departureDateKey(date: string): string {
  return format(parseISO(date), "yyyy-MM-dd");
}
