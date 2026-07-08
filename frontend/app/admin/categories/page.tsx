import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CategoryList } from "@/components/admin/categories/CategoryList";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "categories.view")) redirect("/admin/dashboard");

  return <CategoryList user={session.user} />;
}
