import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BookingForm } from "@/components/admin/bookings/BookingForm";

export default async function NewAdminBookingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "bookings.create")) redirect("/admin/bookings");

  return <BookingForm mode="create" />;
}
