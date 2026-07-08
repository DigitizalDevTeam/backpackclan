import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DestinationList } from "@/components/admin/destinations/DestinationList";

export default async function DestinationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "destinations.view")) redirect("/admin/dashboard");

  return <DestinationList user={session.user} />;
}
