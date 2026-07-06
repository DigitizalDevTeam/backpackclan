import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { BannerList } from "@/components/admin/banners/BannerList";

export default async function BannersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <BannerList userRole={session.user.role} />;
}
