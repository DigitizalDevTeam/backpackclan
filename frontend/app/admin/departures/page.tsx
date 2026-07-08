import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DepartureList } from "@/components/admin/departures/DepartureList";

type PageProps = {
  searchParams: Promise<{ trip?: string }>;
};

export default async function DeparturesPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "departures.view")) redirect("/admin/dashboard");

  const { trip } = await searchParams;

  return <DepartureList user={session.user} defaultTripFilter={trip ?? ""} />;
}
