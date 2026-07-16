import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { ReviewList } from "@/components/admin/reviews/ReviewList";

export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "bookings.view")) redirect("/admin/dashboard");

  return <ReviewList user={session.user} />;
}
