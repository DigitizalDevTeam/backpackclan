import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SeoEditForm } from "@/components/admin/seo/SeoEditForm";

type PageProps = {
  params: Promise<{ pageKey: string }>;
};

export default async function SeoEditPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { pageKey } = await params;

  return <SeoEditForm pageKey={pageKey} userRole={session.user.role} />;
}
