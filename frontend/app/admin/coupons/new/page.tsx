import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

export default async function NewAdminCouponPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "coupons.create")) redirect("/admin/coupons");

  return <CouponForm mode="create" user={session.user} />;
}
