import type {
  AdminTripReview,
  BookingReviewMeta,
  CustomerTripReview,
  TripReviewStatus,
} from "@/types/booking-review";
import type { Booking } from "@/types/booking";
import { loadMockData, saveMockData } from "@/lib/mock/persistence";
import { getBookingById } from "@/lib/mock/booking-store";

const STORAGE_KEY = "trip_reviews";

function loadReviews(): CustomerTripReview[] {
  return loadMockData<CustomerTripReview[]>(STORAGE_KEY, []);
}

function saveReviews(reviews: CustomerTripReview[]): void {
  saveMockData(STORAGE_KEY, reviews);
}

function tripHasEnded(booking: Booking): boolean {
  if (!booking.batchDate) return false;
  const start = new Date(booking.batchDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end <= new Date();
}

export function getBookingReviewMeta(
  bookingId: string,
  userId: string
): { ok: true; data: BookingReviewMeta } | { ok: false; error: string; status: number } {
  const booking = getBookingById(bookingId);
  if (!booking || booking.customerId !== userId) {
    return { ok: false, error: "Booking not found", status: 404 };
  }

  const reviews = loadReviews();
  const review = reviews.find((r) => r.bookingId === bookingId) ?? null;

  if (review?.status === "rejected") {
    return {
      ok: true,
      data: {
        canReview: false,
        reason: "This review was not approved. Contact support if you need help.",
        review,
      },
    };
  }

  if (review) {
    return {
      ok: true,
      data: { canReview: false, reason: null, review },
    };
  }

  if (!["confirmed", "completed"].includes(booking.status)) {
    return {
      ok: true,
      data: {
        canReview: false,
        reason: "Reviews are available after your booking is confirmed.",
        review: null,
      },
    };
  }

  if (booking.paidAmount <= 0) {
    return {
      ok: true,
      data: {
        canReview: false,
        reason: "Complete payment before leaving a review.",
        review: null,
      },
    };
  }

  if (!tripHasEnded(booking)) {
    return {
      ok: true,
      data: {
        canReview: false,
        reason: "You can submit a review after your trip ends.",
        review: null,
      },
    };
  }

  return {
    ok: true,
    data: { canReview: true, reason: null, review: null },
  };
}

export function submitBookingReview(
  bookingId: string,
  userId: string,
  rating: number,
  text: string
): { ok: true; data: CustomerTripReview } | { ok: false; error: string; status: number } {
  const meta = getBookingReviewMeta(bookingId, userId);
  if (!meta.ok) return meta;

  if (!meta.data.canReview) {
    return {
      ok: false,
      error: meta.data.reason ?? "You cannot review this booking yet.",
      status: 422,
    };
  }

  const booking = getBookingById(bookingId)!;
  const reviews = loadReviews();
  const now = new Date().toISOString();
  const review: CustomerTripReview = {
    id: `rv-${Date.now()}`,
    bookingId,
    userId,
    tripId: booking.tripId ?? null,
    rating,
    text: text.trim(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  reviews.push(review);
  saveReviews(reviews);

  return { ok: true, data: review };
}

export function listAdminReviews(filters?: {
  status?: TripReviewStatus;
  search?: string;
}): AdminTripReview[] {
  const reviews = loadReviews();
  const q = (filters?.search ?? "").toLowerCase();

  return reviews
    .map((review) => {
      const booking = getBookingById(review.bookingId);
      return {
        ...review,
        customerName: "Demo Customer",
        tripTitle: booking?.tripTitle,
        tripSlug: booking?.tripSlug,
        bookingRef: booking?.bookingRef,
      };
    })
    .filter((review) => {
      if (filters?.status && review.status !== filters.status) return false;
      if (!q) return true;
      return (
        review.text.toLowerCase().includes(q) ||
        (review.tripTitle ?? "").toLowerCase().includes(q) ||
        (review.bookingRef ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function moderateAdminReview(
  reviewId: string,
  status: TripReviewStatus
): { ok: true; data: AdminTripReview } | { ok: false; error: string; status: number } {
  if (!["approved", "rejected"].includes(status)) {
    return { ok: false, error: "Invalid review status", status: 422 };
  }

  const reviews = loadReviews();
  const index = reviews.findIndex((r) => r.id === reviewId);
  if (index === -1) {
    return { ok: false, error: "Review not found", status: 404 };
  }

  reviews[index] = {
    ...reviews[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  saveReviews(reviews);

  const booking = getBookingById(reviews[index].bookingId);
  return {
    ok: true,
    data: {
      ...reviews[index],
      customerName: "Demo Customer",
      tripTitle: booking?.tripTitle,
      tripSlug: booking?.tripSlug,
      bookingRef: booking?.bookingRef,
      moderatedAt: new Date().toISOString(),
    },
  };
}

export function getApprovedReviewsForTripSlug(tripSlug: string): CustomerTripReview[] {
  const reviews = loadReviews().filter((r) => r.status === "approved");
  return reviews.filter((review) => {
    const booking = getBookingById(review.bookingId);
    return booking?.tripSlug === tripSlug;
  });
}
