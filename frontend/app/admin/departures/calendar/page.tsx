import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DepartureCalendar } from "@/components/admin/departures/DepartureCalendar";

export default async function DeparturesCalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "departures.view")) redirect("/admin/dashboard");

  return <DepartureCalendar user={session.user} />;
}
