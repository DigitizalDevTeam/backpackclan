import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BlogList } from "@/components/admin/blogs/BlogList";

export default async function BlogsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "blogs.view")) redirect("/admin/dashboard");

  return <BlogList user={session.user} />;
}
