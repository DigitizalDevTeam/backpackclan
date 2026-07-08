import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { TripForm } from "@/components/admin/trips/TripForm";

export default async function NewTripPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "trips.create")) redirect("/admin/trips");

  return <TripForm user={session.user} />;
}
