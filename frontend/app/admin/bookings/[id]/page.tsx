import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BookingForm } from "@/components/admin/bookings/BookingForm";
import { laravelFetch, useLaravelApi } from "@/lib/api/backend";
import { getAdminBookingById } from "@/lib/mock/booking-store";
import type { AdminBooking } from "@/types/admin-booking";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function loadBooking(
  id: string,
  token: string
): Promise<AdminBooking | null> {
  if (useLaravelApi()) {
    const { res, data } = await laravelFetch<{
      success: boolean;
      data?: AdminBooking;
    }>(`/v1/admin/bookings/${id}`, { token });
    if (!res.ok || !data.success || !data.data) return null;
    return data.data;
  }
  return getAdminBookingById(id);
}

export default async function EditAdminBookingPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "bookings.view")) redirect("/admin/dashboard");

  const booking = await loadBooking(id, session.token);
  if (!booking) notFound();

  const canUpdate = hasPermission(session.user, "bookings.update");
  if (!canUpdate) {
    // Still show form read-only-ish by denying update API; allow viewing via form
  }

  return <BookingForm mode="edit" booking={booking} />;
}
