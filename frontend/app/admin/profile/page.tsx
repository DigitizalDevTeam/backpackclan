import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/admin/users/ChangePasswordForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return <ChangePasswordForm user={session.user} />;
}
