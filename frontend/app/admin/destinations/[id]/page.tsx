import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { DestinationForm } from "@/components/admin/destinations/DestinationForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDestinationPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "destinations.view")) redirect("/admin/dashboard");

  const { id } = await params;

  return <DestinationForm destinationId={id} user={session.user} />;
}
