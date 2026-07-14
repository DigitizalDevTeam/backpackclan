import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CouponForm } from "@/components/admin/coupons/CouponForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminCouponPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "coupons.view")) redirect("/admin/dashboard");
  if (!id) notFound();

  return <CouponForm mode="edit" couponId={id} user={session.user} />;
}
