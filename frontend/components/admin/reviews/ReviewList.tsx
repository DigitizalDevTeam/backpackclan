"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { hasPermission } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/site/format";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/types/auth";
import type { AdminTripReview, TripReviewStatus } from "@/types/booking-review";
import { REVIEW_STATUS_LABELS } from "@/types/booking-review";

const statusStyles: Record<TripReviewStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

interface ReviewListProps {
  user: AuthUser;
}

export function ReviewList({ user }: ReviewListProps) {
  const canUpdate = hasPermission(user, "bookings.update");

  const [reviews, setReviews] = useState<AdminTripReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TripReviewStatus | "all">("pending");
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) setReviews(data.data);
      else toast.error("Failed to load reviews");
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return reviews.filter((review) => {
      const matchesSearch =
        review.text.toLowerCase().includes(q) ||
        (review.customerName ?? "").toLowerCase().includes(q) ||
        (review.tripTitle ?? "").toLowerCase().includes(q) ||
        (review.bookingRef ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reviews, search, statusFilter]);

  async function moderateReview(reviewId: string, status: TripReviewStatus) {
    setActingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.errors?.form || "Update failed");
      }
      toast.success(`Review ${status}`);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setActingId(null);
    }
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trip reviews"
        description="Moderate customer reviews submitted after completed trips."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search reviews, trips, booking refs…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TripReviewStatus | "all")}
          className="sm:w-48"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="Customer reviews will appear here after they submit feedback on completed bookings."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <article key={review.id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={cn("border-0", statusStyles[review.status])}>
                      {REVIEW_STATUS_LABELS[review.status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {review.bookingRef ?? review.bookingId}
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">
                    {review.tripTitle ?? "Trip"}
                    {review.tripSlug ? (
                      <>
                        {" "}
                        <Link
                          href={`/trips/${review.tripSlug}`}
                          className="text-sm font-normal text-primary hover:underline"
                          target="_blank"
                        >
                          View trip
                        </Link>
                      </>
                    ) : null}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {review.customerName ?? "Customer"} · {formatDateTime(review.createdAt)}
                  </p>
                </div>
                {canUpdate && review.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingId === review.id}
                      onClick={() => moderateReview(review.id, "rejected")}
                    >
                      {actingId === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      disabled={actingId === review.id}
                      onClick={() => moderateReview(review.id, "approved")}
                    >
                      {actingId === review.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.text}&rdquo;
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
