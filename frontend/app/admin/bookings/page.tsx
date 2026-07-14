import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BookingList } from "@/components/admin/bookings/BookingList";

export default async function AdminBookingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "bookings.view")) redirect("/admin/dashboard");

  return <BookingList user={session.user} />;
}
