import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DepartureForm } from "@/components/admin/departures/DepartureForm";

type PageProps = {
  searchParams: Promise<{ trip?: string }>;
};

export default async function NewDeparturePage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "departures.create")) redirect("/admin/departures");

  const { trip } = await searchParams;

  return <DepartureForm user={session.user} defaultTripId={trip ?? ""} />;
}
