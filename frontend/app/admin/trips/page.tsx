import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { TripList } from "@/components/admin/trips/TripList";

export default async function TripsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "trips.view")) redirect("/admin/dashboard");

  return <TripList user={session.user} />;
}
