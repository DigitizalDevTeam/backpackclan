import type { Metadata } from "next";
import { AccountProfile } from "@/components/account/AccountProfile";

export const metadata: Metadata = {
  title: "Profile — My Account | Backpackclan",
  description: "Manage your Backpackclan account profile.",
};

export default function AccountProfilePage() {
  return <AccountProfile />;
}
