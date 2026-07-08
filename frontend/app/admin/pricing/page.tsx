import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PricingList } from "@/components/admin/pricing/PricingList";

export default async function PricingPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "pricing.view")) redirect("/admin/dashboard");

  return <PricingList user={session.user} />;
}
