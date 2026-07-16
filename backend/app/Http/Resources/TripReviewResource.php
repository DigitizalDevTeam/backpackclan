<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TripReview */
class TripReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'bookingId' => (string) $this->booking_id,
            'userId' => (string) $this->user_id,
            'tripId' => $this->trip_id ? (string) $this->trip_id : null,
            'rating' => (int) $this->rating,
            'text' => $this->text,
            'status' => $this->status,
            'customerName' => $this->whenLoaded('user', fn () => $this->user?->name ?? 'Traveler'),
            'tripTitle' => $this->whenLoaded('booking', fn () => $this->booking?->trip_title),
            'tripSlug' => $this->whenLoaded('booking', fn () => $this->booking?->trip_slug),
            'bookingRef' => $this->whenLoaded('booking', fn () => $this->booking?->booking_ref),
            'moderatedAt' => $this->moderated_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
