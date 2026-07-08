import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PricingTripForm } from "@/components/admin/pricing/PricingTripForm";

type PageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function PricingTripPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "pricing.view")) redirect("/admin/dashboard");

  const { tripId } = await params;

  return <PricingTripForm tripId={tripId} user={session.user} />;
}
