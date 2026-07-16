<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Trip;
use App\Models\TripReview;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class TripReviewService
{
    /**
     * @return array{canReview: bool, reason: ?string}
     */
    public function eligibility(Booking $booking): array
    {
        if (! in_array($booking->status, ['confirmed', 'completed'], true)) {
            return [
                'canReview' => false,
                'reason' => 'Reviews are available after your booking is confirmed.',
            ];
        }

        if ((int) $booking->paid_amount <= 0) {
            return [
                'canReview' => false,
                'reason' => 'Complete payment before leaving a review.',
            ];
        }

        if (! $this->tripHasEnded($booking)) {
            return [
                'canReview' => false,
                'reason' => 'You can submit a review after your trip ends.',
            ];
        }

        $existing = $booking->relationLoaded('tripReview')
            ? $booking->tripReview
            : TripReview::query()->where('booking_id', $booking->id)->first();

        if ($existing && $existing->status === TripReview::STATUS_REJECTED) {
            return [
                'canReview' => false,
                'reason' => 'This review was not approved. Contact support if you need help.',
            ];
        }

        return ['canReview' => true, 'reason' => null];
    }

    public function tripHasEnded(Booking $booking): bool
    {
        if (! $booking->batch_date) {
            return false;
        }

        $endDate = $this->tripEndDate($booking);

        return $endDate->lte(now()->startOfDay());
    }

    public function tripEndDate(Booking $booking): Carbon
    {
        $start = $booking->batch_date->copy()->startOfDay();
        $durationDays = 1;

        if ($booking->trip_id) {
            $trip = $booking->relationLoaded('trip')
                ? $booking->trip
                : Trip::query()->find($booking->trip_id);

            if ($trip && (int) $trip->duration_days > 0) {
                $durationDays = (int) $trip->duration_days;
            }
        }

        return $start->addDays(max(1, $durationDays) - 1);
    }

    public function submit(Booking $booking, User $user, int $rating, string $text): TripReview
    {
        if ($booking->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'form' => 'Booking not found',
            ]);
        }

        $eligibility = $this->eligibility($booking);
        if (! $eligibility['canReview']) {
            $existing = TripReview::query()->where('booking_id', $booking->id)->first();
            if ($existing && in_array($existing->status, [TripReview::STATUS_PENDING, TripReview::STATUS_APPROVED], true)) {
                throw ValidationException::withMessages([
                    'form' => 'You have already submitted a review for this booking.',
                ]);
            }

            throw ValidationException::withMessages([
                'form' => $eligibility['reason'] ?? 'You cannot review this booking yet.',
            ]);
        }

        $existing = TripReview::query()->where('booking_id', $booking->id)->first();
        if ($existing) {
            throw ValidationException::withMessages([
                'form' => 'You have already submitted a review for this booking.',
            ]);
        }

        return TripReview::query()->create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'trip_id' => $booking->trip_id,
            'rating' => $rating,
            'text' => trim($text),
            'status' => TripReview::STATUS_PENDING,
        ]);
    }

    public function moderate(TripReview $review, string $status, User $moderator): TripReview
    {
        if (! in_array($status, [TripReview::STATUS_APPROVED, TripReview::STATUS_REJECTED], true)) {
            throw ValidationException::withMessages([
                'status' => 'Invalid review status',
            ]);
        }

        $review->status = $status;
        $review->moderated_by = $moderator->id;
        $review->moderated_at = now();
        $review->save();

        return $review->fresh(['user', 'booking', 'trip', 'moderator']);
    }
}
