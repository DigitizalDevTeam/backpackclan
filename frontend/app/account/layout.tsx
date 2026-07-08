import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isCustomerUser } from "@/lib/auth/user-kind";
import { AccountShell } from "@/components/account/AccountShell";
import { getSiteLayoutData } from "@/lib/site/public-data";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!isCustomerUser(session.user)) {
    redirect("/admin/dashboard");
  }

  const layout = getSiteLayoutData();

  return (
    <AccountShell
      settings={layout.settings}
      headerMenu={layout.headerMenu}
      footerMenu={layout.footerMenu}
      mobileMenu={layout.mobileMenu}
      mediaMap={layout.mediaMap}
      destinationLinks={layout.destinationLinks}
    >
      {children}
    </AccountShell>
  );
}
