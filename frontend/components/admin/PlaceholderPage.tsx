import { Construction } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Badge } from "@/components/ui/badge";

interface PlaceholderPageProps {
  title: string;
  description: string;
  phase?: string;
}

export function PlaceholderPage({
  title,
  description,
  phase = "Phase 2+",
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        action={<Badge variant="warning">{phase}</Badge>}
      />
      <EmptyState
        icon={<Construction className="h-6 w-6" />}
        title="Module coming soon"
        description={`The ${title} module will be implemented in the next development phase. Navigation and layout are ready.`}
      />
    </div>
  );
}
