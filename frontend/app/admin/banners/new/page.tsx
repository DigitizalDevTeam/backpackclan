import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BannerForm } from "@/components/admin/banners/BannerForm";

export default async function NewBannerPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <BannerForm userRole={session.user.role} />;
}
