import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { HomepageSectionList } from "@/components/admin/homepage/HomepageSectionList";

export default async function HomepagePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <HomepageSectionList userRole={session.user.role} />;
}
