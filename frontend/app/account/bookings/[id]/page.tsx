import type { Metadata } from "next";
import { BookingDetailView } from "@/components/account/BookingsPanel";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Booking Details — Backpackclan",
};

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
