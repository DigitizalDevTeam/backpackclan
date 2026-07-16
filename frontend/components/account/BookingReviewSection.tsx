"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import type { BookingReviewMeta } from "@/types/booking-review";
import { REVIEW_STATUS_LABELS } from "@/types/booking-review";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface BookingReviewSectionProps {
  bookingId: string;
}

export function BookingReviewSection({ bookingId }: BookingReviewSectionProps) {
  const [meta, setMeta] = useState<BookingReviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const loadMeta = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/review`);
      const data = await res.json();
      if (data.success) {
        setMeta(data.data);
        if (data.data.review) {
          setRating(data.data.review.rating);
          setText(data.data.review.text);
        }
      }
    } catch {
      toast.error("Failed to load review status");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim().length < 20) {
      toast.error("Please write at least 20 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const message =
          data.errors?.form ||
          data.errors?.text?.[0] ||
          data.errors?.rating?.[0] ||
          "Could not submit review";
        throw new Error(message);
      }
      toast.success("Review submitted — it will appear after approval");
      loadMeta();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading review options…
      </div>
    );
  }

  if (!meta) return null;

  if (meta.review) {
    const statusStyle =
      meta.review.status === "approved"
        ? "bg-green-100 text-green-800"
        : meta.review.status === "rejected"
          ? "bg-red-100 text-red-800"
          : "bg-amber-100 text-amber-800";

    return (
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your review</h2>
          <Badge className={cn("border-0", statusStyle)}>
            {REVIEW_STATUS_LABELS[meta.review.status]}
          </Badge>
        </div>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: meta.review.rating }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{meta.review.text}&rdquo;
        </p>
        {meta.review.status === "pending" ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Your review is awaiting moderation and will appear on the trip page once approved.
          </p>
        ) : null}
      </div>
    );
  }

  if (!meta.canReview) {
    if (!meta.reason) return null;

    return (
      <div className="rounded-2xl border border-dashed bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Trip review</h2>
        <p className="mt-2 text-sm text-muted-foreground">{meta.reason}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold">Share your experience</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Tell future travelers what you loved about this trip.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label>Rating</Label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const value = i + 1;
              const active = value <= (hoverRating || rating);
              return (
                <button
                  key={value}
                  type="button"
                  className="rounded p-1 transition hover:scale-110"
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} stars`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      active ? "fill-amber-400 text-amber-400" : "text-slate-300"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-text">Your review</Label>
          <Textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="What stood out about the guides, itinerary, accommodations, or overall experience?"
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">{text.length}/2000 characters (min 20)</p>
        </div>

        <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            "Submit review"
          )}
        </Button>
      </form>
    </div>
  );
}
