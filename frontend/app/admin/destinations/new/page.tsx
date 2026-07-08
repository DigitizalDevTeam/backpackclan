import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DestinationForm } from "@/components/admin/destinations/DestinationForm";

export default async function NewDestinationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "destinations.create")) redirect("/admin/destinations");

  return <DestinationForm user={session.user} />;
}
