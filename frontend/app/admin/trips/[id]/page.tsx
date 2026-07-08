import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { TripForm } from "@/components/admin/trips/TripForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTripPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "trips.view")) redirect("/admin/dashboard");

  const { id } = await params;
  return <TripForm tripId={id} user={session.user} />;
}
