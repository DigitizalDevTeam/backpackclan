import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { LeadList } from "@/components/admin/leads/LeadList";

export default async function AdminLeadsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "leads.view")) redirect("/admin/dashboard");

  return <LeadList user={session.user} />;
}
