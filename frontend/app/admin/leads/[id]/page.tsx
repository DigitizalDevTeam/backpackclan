import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { LeadDetail } from "@/components/admin/leads/LeadDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "leads.view")) redirect("/admin/dashboard");
  if (!id) notFound();

  return <LeadDetail leadId={id} user={session.user} />;
}
