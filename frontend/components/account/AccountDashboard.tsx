"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Loader2,
  MapPin,
  Wallet,
} from "lucide-react";
import type { Booking } from "@/types/booking";
import { formatDate } from "@/lib/site/format";
import { formatInr } from "@/lib/site/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusStyles: Record<Booking["status"], string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-slate-100 text-slate-700",
};

export function AccountDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customer/bookings");
      const data = await res.json();
      if (data.success) setBookings(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const upcoming = bookings.filter((b) => b.status === "confirmed" || b.status === "pending");
  const totalDue = bookings.reduce((sum, b) => sum + b.balanceDue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back — here&apos;s an overview of your trips and payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total bookings</p>
          <p className="mt-1 text-3xl font-bold text-primary">{bookings.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Upcoming trips</p>
          <p className="mt-1 text-3xl font-bold">{upcoming.length}</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Balance due</p>
          <p className="mt-1 text-3xl font-bold text-orange-600">{formatInr(totalDue)}</p>
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent bookings</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/account/bookings">View all</Link>
          </Button>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl border bg-white py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No bookings yet</p>
            <Button asChild className="mt-4 bg-orange-500 hover:bg-orange-600">
              <Link href="/trips">Browse trips</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <Link
                key={booking.id}
                href={`/account/bookings/${booking.id}`}
                className="block rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        statusStyles[booking.status]
                      )}
                    >
                      {booking.status}
                    </span>
                    <h3 className="mt-2 font-semibold">{booking.tripTitle}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {booking.destination} · {formatDate(booking.batchDate)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    {booking.balanceDue > 0 ? (
                      <p className="flex items-center justify-end gap-1 font-medium text-orange-600">
                        <Wallet className="h-3.5 w-3.5" />
                        {formatInr(booking.balanceDue)} due
                      </p>
                    ) : (
                      <p className="font-medium text-green-600">Fully paid</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
