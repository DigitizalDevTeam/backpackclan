<?php

namespace App\Models;

use App\Support\CamelCase;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Departure extends Model
{
    protected $fillable = [
        'trip_id',
        'start_date',
        'end_date',
        'total_seats',
        'booked_seats',
        'is_guaranteed',
        'is_booking_closed_manual',
        'booking_closed_at',
        'is_cancelled',
        'cancellation_deadline',
        'pricing_override',
        'internal_notes',
        'status_override',
        'status_override_reason',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'cancellation_deadline' => 'date',
            'booking_closed_at' => 'datetime',
            'pricing_override' => 'array',
            'is_guaranteed' => 'boolean',
            'is_booking_closed_manual' => 'boolean',
            'is_cancelled' => 'boolean',
            'total_seats' => 'integer',
            'booked_seats' => 'integer',
        ];
    }

    public function trip(): BelongsTo
    {
        return $this->belongsTo(Trip::class);
    }

    public function availableSeats(): int
    {
        return max(0, (int) $this->total_seats - (int) $this->booked_seats);
    }

    /**
     * Resolve seat/status badge value used by the admin UI.
     */
    public function resolveEffectiveStatus(): string
    {
        $valid = [
            'available',
            'limited',
            'last_few',
            'sold_out',
            'guaranteed',
            'booking_closed',
            'cancelled',
        ];

        if ($this->status_override && in_array($this->status_override, $valid, true)) {
            return $this->status_override;
        }

        if ($this->is_cancelled) {
            return 'cancelled';
        }

        $today = now()->startOfDay();
        $bookingClosed = (bool) $this->is_booking_closed_manual;

        if ($this->booking_closed_at && $today->gte($this->booking_closed_at->copy()->startOfDay())) {
            $bookingClosed = true;
        }

        if ($this->cancellation_deadline && $this->cancellation_deadline->copy()->startOfDay()->lt($today)) {
            $bookingClosed = true;
        }

        if ($bookingClosed) {
            return 'booking_closed';
        }

        if ($this->is_guaranteed) {
            return 'guaranteed';
        }

        $available = $this->availableSeats();
        $total = max(1, (int) $this->total_seats);

        if ($available <= 0) {
            return 'sold_out';
        }

        $ratio = $available / $total;
        if ($ratio <= 0.2) {
            return 'last_few';
        }
        if ($ratio <= 0.5) {
            return 'limited';
        }

        return 'available';
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        return CamelCase::convert([
            'id' => (string) $this->id,
            'trip_id' => (string) $this->trip_id,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),
            'total_seats' => $this->total_seats,
            'booked_seats' => $this->booked_seats,
            'available_seats' => $this->availableSeats(),
            'effective_status' => $this->resolveEffectiveStatus(),
            'is_guaranteed' => $this->is_guaranteed,
            'is_booking_closed_manual' => $this->is_booking_closed_manual,
            'booking_closed_at' => $this->booking_closed_at?->toISOString(),
            'is_cancelled' => $this->is_cancelled,
            'cancellation_deadline' => $this->cancellation_deadline?->format('Y-m-d'),
            'pricing_override' => $this->pricing_override,
            'internal_notes' => $this->internal_notes ?? '',
            'status_override' => $this->status_override,
            'status_override_reason' => $this->status_override_reason ?? '',
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ]);
    }
}
