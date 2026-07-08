"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, startOfMonth } from "date-fns";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { CalendarMonthView } from "@/components/forms/travel/CalendarMonthView";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/auth/permissions";
import type { CalendarDeparture } from "@/types/travel";
import type { AuthUser } from "@/types/auth";

interface DepartureCalendarProps {
  user: AuthUser;
}

export function DepartureCalendar({ user }: DepartureCalendarProps) {
  const router = useRouter();
  const canCreate = hasPermission(user, "departures.create");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [departures, setDepartures] = useState<CalendarDeparture[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKey = format(month, "yyyy-MM");

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/departures/calendar?month=${monthKey}`);
      const result = await res.json();
      if (result.success) setDepartures(result.data);
      else toast.error("Failed to load calendar");
    } catch {
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departure Calendar"
        description="Month view of all scheduled departures with seat status."
        action={
          <div className="flex gap-2">
            {canCreate && (
              <Button asChild>
                <Link href="/admin/departures/new">
                  <Plus className="h-4 w-4" />
                  Add Departure
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admin/departures">
                <ArrowLeft className="h-4 w-4" />
                List view
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <LoadingSkeleton variant="cards" />
      ) : (
        <CalendarMonthView
          departures={departures}
          month={month}
          onMonthChange={setMonth}
          onDepartureClick={(dep) => router.push(`/admin/departures/${dep.id}`)}
        />
      )}
    </div>
  );
}
