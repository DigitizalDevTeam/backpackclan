export type TripReviewStatus = "pending" | "approved" | "rejected";

export interface CustomerTripReview {
  id: string;
  bookingId: string;
  userId: string;
  tripId?: string | null;
  rating: number;
  text: string;
  status: TripReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingReviewMeta {
  canReview: boolean;
  reason?: string | null;
  review: CustomerTripReview | null;
}

export interface AdminTripReview extends CustomerTripReview {
  customerName?: string;
  tripTitle?: string;
  tripSlug?: string;
  bookingRef?: string;
  moderatedAt?: string | null;
}

export const REVIEW_STATUS_LABELS: Record<TripReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};
