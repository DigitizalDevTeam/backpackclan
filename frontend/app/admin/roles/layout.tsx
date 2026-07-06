import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";

export default async function RolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !hasPermission(session.user, "roles.view")) {
    redirect("/admin/dashboard");
  }

  return children;
}
