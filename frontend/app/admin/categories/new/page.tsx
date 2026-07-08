import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

export default async function NewCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "categories.create")) redirect("/admin/categories");

  return <CategoryForm user={session.user} />;
}
