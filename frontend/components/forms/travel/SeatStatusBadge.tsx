import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DEPARTURE_STATUS_LABELS,
  type DepartureStatus,
} from "@/types/travel";

interface SeatStatusBadgeProps {
  status: DepartureStatus;
  className?: string;
}

export function SeatStatusBadge({ status, className }: SeatStatusBadgeProps) {
  const config =
    DEPARTURE_STATUS_LABELS[status] ??
    DEPARTURE_STATUS_LABELS.available;

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

/** Compute departure status from seat counts. */
export function computeDepartureStatus(
  totalSeats: number,
  bookedSeats: number,
  options?: {
    isGuaranteed?: boolean;
    bookingClosed?: boolean;
    cancelled?: boolean;
  }
): DepartureStatus {
  if (options?.cancelled) return "cancelled";
  if (options?.bookingClosed) return "booking_closed";
  if (options?.isGuaranteed) return "guaranteed";

  const available = totalSeats - bookedSeats;
  if (available <= 0) return "sold_out";

  const ratio = available / totalSeats;
  if (ratio <= 0.2) return "last_few";
  if (ratio <= 0.5) return "limited";
  return "available";
}
