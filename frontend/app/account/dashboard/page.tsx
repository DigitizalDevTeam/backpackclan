import type { Metadata } from "next";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "Dashboard — My Account | Backpackclan",
  description: "Your Backpackclan customer dashboard overview.",
};

export default function AccountDashboardPage() {
  return <AccountDashboard />;
}
