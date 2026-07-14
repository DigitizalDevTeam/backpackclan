import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { LeadForm } from "@/components/admin/leads/LeadForm";

export default async function NewAdminLeadPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "leads.create")) redirect("/admin/leads");

  return <LeadForm user={session.user} />;
}
