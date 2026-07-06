import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { MenuEditor } from "@/components/admin/menus/MenuEditor";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MenuEditPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  return <MenuEditor menuId={id} userRole={session.user.role} />;
}
