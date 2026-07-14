import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CouponList } from "@/components/admin/coupons/CouponList";

export default async function AdminCouponsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "coupons.view")) redirect("/admin/dashboard");

  return <CouponList user={session.user} />;
}
