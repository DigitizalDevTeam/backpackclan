import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BannerForm } from "@/components/admin/banners/BannerForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBannerPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  return <BannerForm bannerId={id} userRole={session.user.role} />;
}
