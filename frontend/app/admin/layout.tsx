import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { isCustomerUser } from "@/lib/auth/user-kind";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Backpackclan Admin",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (isCustomerUser(session.user)) {
    redirect("/account/bookings");
  }

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
