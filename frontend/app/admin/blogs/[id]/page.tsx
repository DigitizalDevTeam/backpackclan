import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { BlogForm } from "@/components/admin/blogs/BlogForm";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, "blogs.view")) redirect("/admin/dashboard");

  const { id } = await params;

  return <BlogForm postId={id} user={session.user} />;
}
