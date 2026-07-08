import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DepartureList } from "@/components/admin/departures/DepartureList";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function TripDeparturesPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "departures.view")) redirect("/admin/dashboard");

  const { id } = await params;

  return (
    <DepartureList
      user={session.user}
      defaultTripFilter={id}
      tripScoped
    />
  );
}
