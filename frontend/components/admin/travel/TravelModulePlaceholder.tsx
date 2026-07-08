import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  permission: string;
};

export async function TravelModulePlaceholder({
  title,
  description,
  permission,
}: ModulePlaceholderProps) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user, permission)) redirect("/admin/dashboard");

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        title="Coming in a later phase"
        description={`${title} management will be implemented in the next Milestone 2 phase. Categories are ready to use now.`}
      />
    </div>
  );
}
