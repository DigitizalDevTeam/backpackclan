import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BlogForm } from "@/components/admin/blogs/BlogForm";

export default async function NewBlogPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "blogs.create")) redirect("/admin/blogs");

  return <BlogForm user={session.user} />;
}
