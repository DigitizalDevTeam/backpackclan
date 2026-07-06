import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export default async function MediaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <MediaLibrary userRole={session.user.role} />;
}
