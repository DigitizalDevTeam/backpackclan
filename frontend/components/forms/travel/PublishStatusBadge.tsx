import { Badge } from "@/components/ui/badge";
import {
  PUBLISH_STATUS_LABELS,
  type PublishStatus,
} from "@/types/travel";

interface PublishStatusBadgeProps {
  status: PublishStatus;
}

export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  const config = PUBLISH_STATUS_LABELS[status];

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
}
