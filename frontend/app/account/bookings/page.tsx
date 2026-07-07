import type { Metadata } from "next";
import { BookingsList } from "@/components/account/BookingsPanel";

export const metadata: Metadata = {
  title: "My Bookings — Backpackclan",
  description: "View and manage your trip bookings.",
};

export default function AccountBookingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="mt-1 text-muted-foreground">
          View trip details, download documents, and pay your balance.
        </p>
      </div>
      <BookingsList />
    </div>
  );
}
