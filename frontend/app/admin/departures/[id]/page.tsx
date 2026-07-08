import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DepartureForm } from "@/components/admin/departures/DepartureForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDeparturePage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "departures.view")) redirect("/admin/dashboard");

  const { id } = await params;

  return <DepartureForm departureId={id} user={session.user} />;
}
