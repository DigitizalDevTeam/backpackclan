import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "categories.view")) redirect("/admin/dashboard");

  const { id } = await params;

  return <CategoryForm categoryId={id} user={session.user} />;
}
